import React, { useState, useCallback } from 'react';
import { Settings } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ResponseCard } from './components/ResponseCard';
import { SessionList } from './components/SessionList';
import { FAQGrid } from './components/FAQGrid';
import { ConnectingOverlay } from './components/ConnectingOverlay';
import { IdleWarningModal } from './components/IdleWarningModal';
import { Message, Agent, Session, FAQItem, Attachment } from './types';
import { geminiService } from './services/geminiService';
import { useChatSounds } from './hooks/useChatSounds';
import { useIdleTimeout } from './hooks/useIdleTimeout';

// Mock Data
const SPECIALIST_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Nina',
    role: 'Domains & Billing',
    description: 'accounts, billing, and domain configuration',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=Nina',
    color: 'from-pink-500 to-purple-500',
    systemPrompt: 'You are Nina, a cheerful and precise expert in GitHub billing, account management, organizations, and domain verification. You focus on administrative tasks. You MUST introduce yourself first, stating your name and expertise. Then, end your first message with the exact phrase: "How can I help you today?".'
  },
  {
    id: 'agent-2',
    name: 'Jake',
    role: 'Repos & Actions',
    description: 'repositories, git operations, and CI/CD pipelines',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Jake',
    color: 'from-blue-500 to-cyan-500',
    systemPrompt: 'You are Jake, a technical expert in Git, GitHub Actions, Runners, and repository management. You love optimizing workflows and solving merge conflicts. You MUST introduce yourself first, stating your name and expertise. Then, end your first message with the exact phrase: "How can I help you today?".'
  },
  {
    id: 'agent-3',
    name: 'Alex',
    role: 'Security & API',
    description: 'security features, API integration, and permissions',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Alex',
    color: 'from-green-500 to-emerald-500',
    systemPrompt: 'You are Alex, a security-focused expert in GitHub Advanced Security, Dependabot, Secret scanning, and the REST/GraphQL APIs. You prioritize safety and best practices. You MUST introduce yourself first, stating your name and expertise. Then, end your first message with the exact phrase: "How can I help you today?".'
  }
];

const TRIAGE_AGENT: Agent = {
  id: 'triage',
  name: 'Support Guide',
  role: 'Intake Specialist',
  description: 'routing your request to the right expert',
  avatar: 'https://avatar.iran.liara.run/public/job/operator/male',
  color: 'from-gray-500 to-gray-700',
  systemPrompt: '',
  isTriage: true
};

const MOCK_FAQS: FAQItem[] = [
  { question: "How do I verify my domain?", category: "Domains" },
  { question: "Why did my Action fail?", category: "Actions" },
  { question: "Reset personal access token", category: "Security" },
  { question: "Change repository visibility", category: "Repos" },
  { question: "Configure Dependabot alerts", category: "Security" },
  { question: "Billing for GitHub Copilot", category: "Billing" },
  { question: "Setup branch protection rules", category: "Repos" },
  { question: "Deploy to GitHub Pages", category: "Actions" }
];

const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess-1',
    agentId: 'agent-2',
    title: 'Node.js CI Pipeline Error',
    lastMessage: 'The workflow file needs a matrix strategy...',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isActive: true
  },
  {
    id: 'sess-2',
    agentId: 'agent-1',
    title: 'Billing Inquiry',
    lastMessage: 'Thanks for clarifying the seat cost.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isActive: false
  },
  {
    id: 'sess-3',
    agentId: 'agent-3',
    title: 'API Rate Limits',
    lastMessage: 'Check the x-ratelimit-remaining header.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isActive: false
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Live Support');
  const [selectedAgent, setSelectedAgent] = useState<Agent>(TRIAGE_AGENT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New state for connecting overlay
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<Agent | null>(null);
  const [pendingUserQuery, setPendingUserQuery] = useState<string>('');

  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();

  // Initialize hooks
  const { playConnected, playDisconnected } = useChatSounds();

  // Handle session end
  const handleSessionEnd = useCallback(() => {
    playDisconnected();
    const endMessage: Message = {
      role: 'model',
      content: 'Session ended due to inactivity. Feel free to start a new conversation!',
      timestamp: new Date(),
      isSystemMessage: true
    };
    setMessages(prev => [...prev, endMessage]);
    setSelectedAgent(TRIAGE_AGENT);
  }, [playDisconnected]);

  // Idle timeout - only active when talking to a specialist
  const {
    showWarning,
    formatTimeRemaining,
    dismissWarning,
    resetTimer
  } = useIdleTimeout({
    warningTimeMs: 3 * 60 * 1000, // 3 minutes
    timeoutMs: 5 * 60 * 1000,     // 5 minutes
    enabled: !selectedAgent.isTriage && messages.length > 0,
    onTimeout: handleSessionEnd
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (text: string, files: File[] = []) => {
    if (!text.trim() && files.length === 0) return;

    // Ensure we switch to live support if sending from FAQ
    if (activeTab !== 'Live Support') setActiveTab('Live Support');

    setIsLoading(true);

    try {
      const attachments: Attachment[] = [];
      for (const file of files) {
        const base64Data = await fileToBase64(file);
        attachments.push({
          mimeType: file.type,
          data: base64Data
        });
      }

      const userMessage: Message = {
        role: 'user',
        content: text,
        timestamp: new Date(),
        attachments: attachments
      };

      setMessages(prev => [...prev, userMessage]);
      setInputText('');

      const response = await geminiService.sendMessage(text, messages, attachments, selectedAgent);

      if (response.handoff && response.handoff.handoff) {
        const triageMessage: Message = {
          role: 'model',
          content: response.handoff.message || "Connecting you to an expert...",
          timestamp: new Date(),
          isSystemMessage: true
        };
        setMessages(prev => [...prev, triageMessage]);

        const newAgentId = response.handoff.agentId;
        const newAgent = SPECIALIST_AGENTS.find(a => a.id === newAgentId);

        if (newAgent) {
          // Show connecting overlay
          setPendingAgent(newAgent);
          setPendingUserQuery(text);
          setIsConnecting(true);
          setIsLoading(false); // Hide the loading indicator while overlay is shown
        }

      } else {
        const botMessage: Message = {
          role: 'model',
          content: response.text,
          timestamp: new Date(),
          sources: response.sources
        };
        setMessages(prev => [...prev, botMessage]);
        resetTimer(); // Reset idle timer on any activity
      }

    } catch (error) {
      console.error("Failed to send message", error);
      const errorMessage: Message = {
        role: 'model',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = (session: Session) => {
    setActiveSessionId(session.id);
    const agent = SPECIALIST_AGENTS.find(a => a.id === session.agentId) || TRIAGE_AGENT;
    setSelectedAgent(agent);
    setMessages([]);
    setActiveTab('Live Support'); // Switch to live support view
  };

  const handleFAQClick = (question: string) => {
    handleSendMessage(question);
  };

  // Called when connecting overlay animation completes
  const handleConnectionComplete = useCallback(async () => {
    if (!pendingAgent) return;

    setIsConnecting(false);
    setSelectedAgent(pendingAgent);
    playConnected(); // Play connection sound

    // Now fetch the specialist's greeting
    setIsLoading(true);
    try {
      const handoffContext = `[SYSTEM: You have just been assigned to this user. The user's initial inquiry was: "${pendingUserQuery}". Please introduce yourself, state your expertise, and end your message with "How can I help you today?". Do NOT answer the question yet, just greet them.]`;
      const specialistResponse = await geminiService.sendMessage(handoffContext, messages, [], pendingAgent);

      const expertMessage: Message = {
        role: 'model',
        content: specialistResponse.text,
        timestamp: new Date(),
        sources: specialistResponse.sources
      };
      setMessages(prev => [...prev, expertMessage]);
    } catch (error) {
      console.error("Failed to get specialist greeting", error);
    } finally {
      setIsLoading(false);
      setPendingAgent(null);
      setPendingUserQuery('');
      resetTimer(); // Start idle timer after connection
    }
  }, [pendingAgent, pendingUserQuery, messages, playConnected, resetTimer]);

  // Handle ending session (from idle modal)
  const handleEndSession = useCallback(() => {
    dismissWarning();
    handleSessionEnd();
  }, [dismissWarning, handleSessionEnd]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Live Support':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-160px)] pb-4 animate-in fade-in duration-500">
            <div className="xl:col-span-8 flex flex-col h-full">
              <ResponseCard
                agent={selectedAgent}
                messages={messages}
                isLoading={isLoading}
                onSend={handleSendMessage}
                inputText={inputText}
                setInputText={setInputText}
              />
            </div>
            <div className="xl:col-span-4 flex flex-col h-full bg-[#F5F5F5] rounded-[2.5rem] p-6 shadow-inner border border-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Active Sessions</h2>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Manage your active conversations.</p>
              <SessionList
                sessions={sessions}
                agents={[...SPECIALIST_AGENTS, TRIAGE_AGENT]}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
              />
            </div>
          </div>
        );
      case 'FAQs':
        return (
          <div className="h-full animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 min-h-[600px]">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Knowledge Base</h2>
              <p className="text-gray-500 mb-10 text-lg">Common questions curated by our support team.</p>
              <FAQGrid faqs={MOCK_FAQS} onAsk={handleFAQClick} />
            </div>
          </div>
        );
      case 'Ongoing History':
      case 'Sessions':
      case 'Report':
        return (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 animate-in fade-in">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Settings size={32} className="opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-gray-500">{activeTab} View</h3>
            <p className="mt-2">This module is currently under development.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#E8E8E8] text-gray-800 font-sans selection:bg-black selection:text-white">
      <Sidebar />

      <main className="flex-1 ml-20 lg:ml-24 p-6 lg:p-8 overflow-hidden h-screen flex flex-col">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </main>

      {/* Connecting Overlay - shown during agent handoff */}
      <ConnectingOverlay
        isVisible={isConnecting}
        agent={pendingAgent}
        onComplete={handleConnectionComplete}
      />

      {/* Idle Warning Modal */}
      <IdleWarningModal
        isVisible={showWarning}
        timeRemaining={formatTimeRemaining()}
        onContinue={dismissWarning}
        onEndSession={handleEndSession}
      />
    </div>
  );
};

export default App;