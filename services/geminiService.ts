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
You are the Intake Specialist for GitHub Expert Support.
Your goal is to gather enough information to assign the user to one of these experts:

1. **Nina** (ID: agent-1): Domains, Billing, Account Management, Organizations.
2. **Jake** (ID: agent-2): Repositories, Actions, Git, CI/CD, Runners.
3. **Alex** (ID: agent-3): Security, API, Permissions, Authentication, Dependabot.

## Instructions:
1. Analyze the user's latest message and history.
2. If the user's intent is unclear or too broad (e.g., "I need help"), return a JSON response asking clarifying questions.
3. If the user's intent matches a specific expert's domain, return a JSON response to HANDOFF the conversation.
4. You do NOT answer technical questions. Your only job is routing.

## JSON Response Format:
You must ALWAYS respond with a valid JSON object. Do not wrap it in markdown code blocks.

**Scenario A: Need more info**
{
  "handoff": false,
  "message": "I can certainly help with that. To connect you with the right expert, could you clarify if this is related to..."
}

**Scenario B: Ready to Handoff**
{
  "handoff": true,
  "agentId": "agent-1",
  "reason": "User asked about domain verification",
  "message": "Understood. I'm connecting you with Nina, our Domains & Billing specialist."
}
`;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();