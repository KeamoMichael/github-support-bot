import React, { useEffect, useState } from 'react';
import { UserX, MessageCircle } from 'lucide-react';
import { Agent } from '../types';

interface DisconnectOverlayProps {
    isVisible: boolean;
    agent: Agent | null;
    onDismiss: () => void;
}

export const DisconnectOverlay: React.FC<DisconnectOverlayProps> = ({
    isVisible,
    agent,
    onDismiss
}) => {
    const [phase, setPhase] = useState<'showing' | 'hiding'>('showing');

    useEffect(() => {
        if (isVisible) {
            setPhase('showing');
            // Auto-dismiss after 4 seconds
            const timer = setTimeout(() => {
                setPhase('hiding');
                setTimeout(onDismiss, 500);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onDismiss]);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${phase === 'hiding' ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`bg-white rounded-[2rem] p-10 max-w-md w-full mx-4 text-center shadow-2xl transition-all duration-500 ${phase === 'hiding' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                {/* Disconnected Icon */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full bg-gray-100 animate-pulse"></div>
                    <div className="absolute inset-2 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserX size={40} className="text-gray-500" />
                    </div>
                </div>

                {/* Main Message */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {agent?.name || 'Agent'} has left the chat
                </h2>

                <p className="text-gray-500 mb-6">
                    Session ended due to inactivity
                </p>

                {/* Subtext with instruction */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                        <MessageCircle size={18} className="text-gray-400" />
                        <span className="text-sm">
                            Send a message to start a new conversation
                        </span>
                    </div>
                </div>

                {/* Continue button */}
                <button
                    onClick={onDismiss}
                    className="mt-6 px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};
