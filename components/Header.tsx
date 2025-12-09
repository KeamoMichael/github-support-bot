import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['Live Support', 'FAQs', 'Ongoing History', 'Sessions', 'Report'];

  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-4 lg:px-8 py-6 mb-4 gap-4">
        {/* Breadcrumb / Title Area */}
        <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="md:hidden mr-2">
                <Menu size={24} />
             </div>
            <h1 className="text-2xl text-gray-800 tracking-tight">
              <span className="font-bold">GitHub</span> <span className="font-normal text-gray-600">Expert Support</span>
            </h1>
        </div>

        {/* Center Pill Navigation */}
        <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-full items-center shadow-sm border border-white/40 overflow-x-auto max-w-full no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab
                            ? 'bg-black text-white shadow-md transform scale-[1.02]'
                            : 'text-gray-500 hover:text-black hover:bg-white/50'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="relative group hidden md:block">
                <input 
                    type="text" 
                    placeholder="Search docs..." 
                    className="pl-10 pr-4 py-2.5 bg-white rounded-full text-sm border-none focus:ring-2 focus:ring-black/5 w-48 transition-all shadow-sm group-hover:shadow-md"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            
            <button className="md:hidden p-3 bg-white rounded-full text-gray-600 hover:bg-gray-50 shadow-sm">
                <Search size={20} />
            </button>

            <button className="p-3 bg-white rounded-full text-gray-600 hover:bg-gray-50 shadow-sm relative transition-transform hover:scale-105">
                <Bell size={20} />
                <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-gray-200 transition-all">
                <img src="https://avatar.iran.liara.run/public/34" alt="User" className="w-full h-full object-cover" />
            </div>
        </div>
    </header>
  );
};