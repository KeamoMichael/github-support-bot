import React from 'react';
import { FAQItem } from '../types';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface FAQGridProps {
  faqs: FAQItem[];
  onAsk: (question: string) => void;
}

export const FAQGrid: React.FC<FAQGridProps> = ({ faqs, onAsk }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {faqs.map((faq, idx) => (
          <button
            key={idx}
            onClick={() => onAsk(faq.question)}
            className="text-left bg-gray-50 hover:bg-black hover:text-white p-6 rounded-[1.5rem] transition-all duration-300 group relative border border-gray-100 hover:border-black hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-white text-black px-2 py-1 rounded-md shadow-sm">{faq.category}</span>
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-50 group-hover:scale-100">
                    <ArrowRight size={14} />
                </div>
            </div>
            <p className="text-base font-bold leading-snug pr-4">
              {faq.question}
            </p>
          </button>
        ))}
    </div>
  );
};