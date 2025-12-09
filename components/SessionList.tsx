import React, { useState } from 'react';
import { Session, Agent } from '../types';
import { MessageCircle, Clock, MoreHorizontal, Archive } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  agents: Agent[];
  activeSessionId?: string;
  onSelectSession: (session: Session) => void;
}

export const SessionList: React.FC<SessionListProps> = ({ sessions, agents, activeSessionId, onSelectSession }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const getAgentAvatar = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.avatar || 'https://github.com/shadcn.png';
  };

  const filteredSessions = sessions.filter(s =>
    activeTab === 'active' ? s.isActive : !s.isActive
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-200/50 p-1 rounded-full w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'active'
            ? 'bg-white text-black shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Active ({sessions.filter(s => s.isActive).length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'history'
            ? 'bg-white text-black shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          History
        </button>
      </div>

      {/* List - with padding at bottom for proper spacing */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 pb-4">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Archive size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No {activeTab} sessions</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className={`group p-4 rounded-[2rem] cursor-pointer transition-all border
                ${activeSessionId === session.id
                  ? 'bg-white border-black shadow-md'
                  : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={getAgentAvatar(session.agentId)}
                    alt="Agent"
                    className="w-10 h-10 rounded-full bg-gray-100"
                  />
                  {session.isActive && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-sm truncate pr-2 ${activeSessionId === session.id ? 'text-black' : 'text-gray-800'}`}>
                      {session.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">
                      {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {session.lastMessage}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  {session.isActive ? <MessageCircle size={12} /> : <Clock size={12} />}
                  <span>{session.isActive ? 'Live Now' : 'Ended'}</span>
                </div>
                <button className="text-gray-300 hover:text-gray-600">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};