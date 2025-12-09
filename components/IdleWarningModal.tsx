import React from 'react';
import { Clock, X, MessageCircle } from 'lucide-react';

interface IdleWarningModalProps {
    isVisible: boolean;
    timeRemaining: string;
    onContinue: () => void;
    onEndSession: () => void;
}

export const IdleWarningModal: React.FC<IdleWarningModalProps> = ({
    isVisible,
    timeRemaining,
    onContinue,
    onEndSession
}) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onContinue} />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Close button */}
                <button
                    onClick={onContinue}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} className="text-gray-400" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={32} className="text-amber-600" />
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Are you still there?
                    </h3>
                    <p className="text-gray-600 mb-4">
                        You've been inactive for a while. Your session will end soon to free up support resources.
                    </p>

                    {/* Countdown */}
                    <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">Session ends in</span>
                        <span className="font-mono font-bold text-amber-600">{timeRemaining}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onEndSession}
                        className="flex-1 px-6 py-3 border border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        End Session
                    </button>
                    <button
                        onClick={onContinue}
                        className="flex-1 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={18} />
                        Yes, I'm here
                    </button>
                </div>
            </div>
        </div>
    );
};
