export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  sources?: Source[];
  attachments?: Attachment[];
  isSystemMessage?: boolean;
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
}

export interface Source {
  title: string;
  uri: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string; // URL to 3D avatar
  color: string;
  systemPrompt: string;
  isTriage?: boolean;
}

export interface Session {
  id: string;
  agentId: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive: boolean;
  unreadCount?: number;
}

export interface FAQItem {
  question: string;
  category: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatar: string;
}

export interface KPIStats {
  docsSearched: number;
  avgResponseTime: string;
  accuracy: string;
  activeContexts: number;
}

export interface HandOffResponse {
  handoff: boolean;
  agentId?: string;
  message?: string;
  reason?: string;
}