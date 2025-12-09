import React from 'react';
import { ExternalLink, BookOpen, User } from 'lucide-react';
import { Source } from '../types';

interface ContextPanelProps {
  sources: Source[];
}

export const ContextPanel: React.FC<ContextPanelProps> = ({ sources }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Team/Collaboration Card (Static Mock) */}
      <div className="bg-white p-5 rounded-[2rem] shadow-sm flex items-center justify-between">
         <div className="flex -space-x-3">
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://picsum.photos/101/101" alt="Team" />
            <img className="w-10 h-10 rounded-full border-2 border-white" src="https://picsum.photos/102/102" alt="Team" />
            <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">+1.2k</div>
         </div>
         <span className="font-semibold text-gray-700">Repositories</span>
      </div>

      {/* Context / Sources Card */}
      <div className="bg-[#EBEBEB] p-6 rounded-[2.5rem] flex-1 flex flex-col shadow-inner">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-gray-800">Context Sources</h3>
            <button className="p-2 bg-white rounded-full text-gray-600 shadow-sm hover:bg-gray-50">
                <BookOpen size={16} />
            </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {sources.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">No sources active.</p>
                    <p className="text-xs mt-1">Ask a question to retrieve docs.</p>
                </div>
            ) : (
                sources.map((source, idx) => (
                    <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate group-hover:text-black">{source.title}</h4>
                                <p className="text-xs text-gray-500 mt-1 truncate">{source.uri.replace('https://docs.github.com/en/', '.../')}</p>
                            </div>
                            <ExternalLink size={14} className="text-gray-400 group-hover:text-gray-600 mt-1 ml-2 flex-shrink-0" />
                        </div>
                    </a>
                ))
            )}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-300/50">
             <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                     <User size={20} />
                 </div>
                 <div>
                     <p className="text-sm font-bold text-gray-800">GLESB Bot</p>
                     <p className="text-xs text-gray-500">Retrieval Augmented</p>
                 </div>
             </div>
             
             <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Confidence</span>
                     <span className="font-bold text-gray-800">98.5%</span>
                 </div>
                 <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden">
                     <div className="bg-black h-full rounded-full w-[98.5%]"></div>
                 </div>
                 
                 <div className="flex gap-2 mt-4">
                     <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-100">Official</span>
                     <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-100">Live</span>
                     <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm border border-gray-100">v2.5</span>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};
