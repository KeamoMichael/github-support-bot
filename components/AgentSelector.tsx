import React from 'react';
import { Agent } from '../types';
import { Check, Sparkles } from 'lucide-react';

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgentId: string;
  onSelectAgent: (agent: Agent) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ agents, selectedAgentId, onSelectAgent }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-yellow-500" size={20} />
        <h2 className="text-lg font-bold text-gray-800">Choose your Expert</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`relative flex items-center gap-4 p-4 rounded-[2rem] transition-all duration-300 border-2 text-left group
                ${isSelected 
                  ? 'bg-black text-white border-black shadow-lg scale-[1.02]' 
                  : 'bg-white text-gray-600 border-transparent hover:border-gray-200 hover:shadow-md'
                }`}
            >
              <div className={`w-14 h-14 rounded-full flex-shrink-0 bg-gradient-to-br ${agent.color} p-0.5 shadow-sm overflow-hidden`}>
                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover bg-white rounded-full" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-base truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {agent.name}
                </h3>
                <p className={`text-xs truncate ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                  {agent.role}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4 text-white">
                  <Check size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};