import React from 'react';
import { MessageSquare, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-20 lg:w-24 flex flex-col items-center pt-12 lg:pt-14 pb-8 bg-[#F3F4F6] border-r border-gray-200 h-full fixed left-0 top-0 z-20 rounded-r-3xl">
      <div className="mb-10">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg cursor-default">
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
        </div>
      </div>
      
      <nav className="flex-1 flex flex-col gap-8 w-full items-center justify-start mt-2">
        <SidebarItem icon={<MessageSquare size={26} />} active tooltip="Live Chat" />
      </nav>

      <div className="mt-auto flex flex-col gap-6 items-center w-full">
         <button className="p-3.5 rounded-2xl hover:bg-white text-gray-500 hover:text-black transition-all duration-300 hover:shadow-md">
            <Settings size={26} />
         </button>
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; active?: boolean; tooltip: string }> = ({ icon, active, tooltip }) => {
  return (
    <div className="relative group">
        <button 
        className={`p-3.5 rounded-2xl transition-all duration-300 ${
            active 
            ? 'bg-black text-white shadow-xl shadow-black/20 scale-110' 
            : 'text-gray-400 hover:bg-white hover:text-black hover:shadow-md'
        }`}
        >
        {icon}
        </button>
        <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {tooltip}
        </span>
    </div>
  );
};