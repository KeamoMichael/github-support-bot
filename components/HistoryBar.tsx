import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';

export const HistoryBar: React.FC = () => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                    <Clock size={18} />
                </div>
                <h3 className="font-bold text-gray-800">REST API Authentication</h3>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 pl-12">
                You asked about generating fine-grained personal access tokens and the scopes required for repo access...
            </p>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="text-gray-400" />
            </div>
        </div>

        <div className="bg-gradient-to-r from-gray-100 to-white p-6 rounded-[2rem] shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-gray-200">
             <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-black text-white rounded-full">
                    <Clock size={18} />
                </div>
                <h3 className="font-bold text-gray-800">GitHub Actions CI/CD</h3>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 pl-12">
                Reviewing the workflow syntax for matrix builds and caching dependencies in Node.js environments...
            </p>
             <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="text-gray-400" />
            </div>
        </div>
    </div>
  );
};
