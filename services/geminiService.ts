import { GoogleGenAI } from "@google/genai";
import { Message, Source, Attachment, Agent, HandOffResponse } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
## System Persona and Role Definition
**Role:** GitHub Expert Support Bot (GLESB)
**Goal:** Answer user queries about GitHub features, workflows, and APIs using official documentation.
**Directive:** You MUST act as a Retrieval-Augmented Generation (RAG) agent. Search docs.github.com for answers.

## RAG Instruction Set
1. **Mandatory Web Search:** Search 'site:docs.github.com <query>' first.
2. **Citation:** Include inline citations [Source: url].
3. **No Guessing:** If answer is not in docs, state it clearly.
4. **Image Analysis:** Analyze provided screenshots for errors/code.
5. **Efficiency:** Do NOT ask follow-up questions unless the user's request is completely ambiguous or missing critical information (like which language they are using for an Action). If you can make a reasonable assumption or provide a general guide, do so immediately.

## formatting
Use Markdown. Code blocks must have language tags.
`;

const TRIAGE_SYSTEM_INSTRUCTION = `
You are Devin, the Support Guide for GitHub Expert Support. You are the friendly face of this platform.

## Your Team of Specialists:
1. **Nina** (ID: agent-1): Domains, Billing, Account Management, Organizations.
2. **Jake** (ID: agent-2): Repositories, Actions, Git, CI/CD, Runners.
3. **Alex** (ID: agent-3): Security, API, Permissions, Authentication, Dependabot.

## Your Behavior:
1. **First Contact**: If this is the user's first message and it's a greeting (hi, hello, etc.) or vague query, introduce yourself warmly and ask how you can help.
2. **Platform Questions**: If the user asks about the platform itself, what services are available, who the experts are, or general information - answer directly without handing off.
3. **Technical GitHub Questions**: If the user has a specific GitHub-related technical question, determine which specialist can best help and hand off.
4. **Unclear Intent**: If you're unsure what the user needs, ask a clarifying question.

## JSON Response Format:
You must ALWAYS respond with a valid JSON object. Do not wrap it in markdown code blocks.

**Scenario A: First contact greeting or platform questions (YOU handle this)**
{
  "handoff": false,
  "message": "Hi there! I'm Devin, your Support Guide. Welcome to GitHub Expert Support! I'm here to help you navigate our platform and connect you with the right specialist when needed. We have experts in Domains & Billing (Nina), Repos & Actions (Jake), and Security & API (Alex). What brings you here today?"
}

**Scenario B: Need clarification**
{
  "handoff": false,
  "message": "I'd be happy to help! Could you tell me a bit more about what you're trying to accomplish? For example, is this related to billing, repository management, or security?"
}

**Scenario C: Ready to Handoff to Specialist**
{
  "handoff": true,
  "agentId": "agent-1",
  "reason": "User asked about domain verification",
  "message": "Great question! Domain verification is Nina's specialty. Let me connect you with her - she's our expert in Domains & Billing. One moment..."
}
`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Check if using a free API key (Google AI Studio free tier)
   * Rate limit tracking only applies to free keys
   */
  private isUsingFreeApiKey(): boolean {
    const apiKeyType = process.env.API_KEY_TYPE?.toLowerCase();
    // Default to 'paid' if not specified (safer to assume no rate limiting)
    return apiKeyType === 'free';
  }

  async sendMessage(
    query: string,
    history: Message[] = [],
    attachments: Attachment[] = [],
    agent?: Agent
  ): Promise<{ text: string; sources: Source[]; handoff?: HandOffResponse }> {
    try {
      const recentHistory = history.slice(-6).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const currentParts: any[] = [];

      if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
          currentParts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data
            }
          });
        });
      }

      currentParts.push({ text: query });

      const contents = [
        ...recentHistory,
        { role: 'user', parts: currentParts }
      ];

      // Triage Logic
      if (agent?.isTriage) {
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
          config: {
            systemInstruction: TRIAGE_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json"
          },
        });

        const jsonText = response.text || "{}";
        let parsed: HandOffResponse;
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          console.error("Failed to parse triage JSON", e);
          parsed = { handoff: false, message: "Could you please rephrase your request?" };
        }

        return {
          text: parsed.message || "Processing...",
          sources: [],
          handoff: parsed
        };
      }

      // Standard Agent Logic
      let finalSystemInstruction = BASE_SYSTEM_INSTRUCTION;
      if (agent) {
        finalSystemInstruction += `\n\n## CURRENT AGENT PERSONA: ${agent.name}\n${agent.systemPrompt}`;
      }

      // Modify the query slightly for RAG context if needed, but usually the system prompt handles it.
      // We append the instruction to search specifically.
      if (!agent?.isTriage) {
        contents[contents.length - 1].parts.push({ text: "\n\n(System: Remember to search docs.github.com)" });
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: finalSystemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: Source[] = groundingChunks
        .map((chunk: any) => {
          if (chunk.web) {
            return { title: chunk.web.title, uri: chunk.web.uri };
          }
          return null;
        })
        .filter((s: Source | null): s is Source => s !== null);

      const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

      return { text, sources: uniqueSources };

    } catch (error: any) {
      console.error("Gemini API Error:", error);

      // Only apply rate limit handling for free API keys
      if (this.isUsingFreeApiKey()) {
        const isRateLimitError = this.isRateLimitError(error);

        if (isRateLimitError) {
          const rateLimitInfo = this.parseRateLimitError(error);
          // Throw a structured rate limit error
          const rateLimitError = new Error(rateLimitInfo.message);
          (rateLimitError as any).rateLimitInfo = rateLimitInfo;
          throw rateLimitError;
        }
      }

      throw error;
    }
  }

  private isRateLimitError(error: any): boolean {
    // Check for 429 status code or quota-related error messages
    if (error?.status === 429) return true;

    const errorMessage = error?.message?.toLowerCase() || '';
    const errorString = JSON.stringify(error).toLowerCase();

    return (
      errorMessage.includes('quota') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('resource has been exhausted') ||
      errorMessage.includes('too many requests') ||
      errorString.includes('quota') ||
      errorString.includes('rate limit')
    );
  }

  private parseRateLimitError(error: any): import('../types').RateLimitError {
    const errorMessage = error?.message || error?.toString() || 'Rate limit exceeded';
    let limitType: 'RPM' | 'TPM' | 'RPD' | 'UNKNOWN' = 'UNKNOWN';
    let retryAfterSeconds: number | undefined;
    let resetTime: Date | undefined;

    // Try to determine limit type from error message
    const msgLower = errorMessage.toLowerCase();
    if (msgLower.includes('minute') || msgLower.includes('rpm')) {
      limitType = 'RPM';
      retryAfterSeconds = 60; // Reset after 1 minute
    } else if (msgLower.includes('tpm') || msgLower.includes('token')) {
      limitType = 'TPM';
      retryAfterSeconds = 60; // Reset after 1 minute
    } else if (msgLower.includes('day') || msgLower.includes('daily') || msgLower.includes('rpd')) {
      limitType = 'RPD';
      // Calculate seconds until next day UTC
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
      retryAfterSeconds = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
    }

    // Check for retry-after header (if available in error object)
    if (error?.headers?.['retry-after']) {
      retryAfterSeconds = parseInt(error.headers['retry-after'], 10);
    }

    // Calculate reset time
    if (retryAfterSeconds) {
      resetTime = new Date(Date.now() + retryAfterSeconds * 1000);
    }

    // Create user-friendly message
    let friendlyMessage = 'API rate limit exceeded. ';
    if (limitType === 'RPM') {
      friendlyMessage += 'You\'ve sent too many requests per minute. Please wait a moment.';
    } else if (limitType === 'TPM') {
      friendlyMessage += 'Token usage limit reached. Please wait a moment.';
    } else if (limitType === 'RPD') {
      friendlyMessage += 'Daily request limit reached. You can resume tomorrow.';
    } else {
      friendlyMessage += 'Please try again later.';
    }

    return {
      isRateLimitError: true,
      limitType,
      resetTime,
      retryAfterSeconds,
      message: friendlyMessage
    };
  }
}

export const geminiService = new GeminiService();