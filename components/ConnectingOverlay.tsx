import React, { useEffect, useState } from 'react';
import { Agent } from '../types';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

interface ConnectingOverlayProps {
    isVisible: boolean;
    agent: Agent | null;
    onComplete?: () => void;
}

type Phase = 'analyzing' | 'found' | 'connecting' | 'connected';

export const ConnectingOverlay: React.FC<ConnectingOverlayProps> = ({
    isVisible,
    agent,
    onComplete
}) => {
    const [phase, setPhase] = useState<Phase>('analyzing');
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (!isVisible || !agent) {
            setPhase('analyzing');
            setIsExiting(false);
            return;
        }

        // Phase progression
        const timers: NodeJS.Timeout[] = [];

        timers.push(setTimeout(() => setPhase('found'), 1200));
        timers.push(setTimeout(() => setPhase('connecting'), 2400));
        timers.push(setTimeout(() => setPhase('connected'), 3600));
        timers.push(setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                onComplete?.();
            }, 400);
        }, 4200));

        return () => timers.forEach(clearTimeout);
    }, [isVisible, agent, onComplete]);

    if (!isVisible || !agent) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-400
      ${isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-white">
                {/* Agent Avatar with animated ring */}
                <div className="relative mb-8">
                    <div className={`absolute inset-0 rounded-full transition-all duration-500
            ${phase === 'analyzing' ? 'animate-ping bg-white/20' : ''}
            ${phase === 'found' ? 'animate-pulse bg-green-500/30 scale-110' : ''}
            ${phase === 'connecting' ? 'animate-spin bg-gradient-to-r from-transparent via-white/30 to-transparent' : ''}
            ${phase === 'connected' ? 'bg-green-500/40 scale-125' : ''}
          `} />

                    <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${agent.color} p-1 shadow-2xl transition-all duration-500
            ${phase === 'found' || phase === 'connecting' || phase === 'connected' ? 'scale-110' : 'scale-100'}
          `}>
                        <img
                            src={agent.avatar}
                            alt={agent.name}
                            className={`w-full h-full rounded-full object-cover bg-white transition-all duration-500
                ${phase === 'analyzing' ? 'opacity-50 grayscale' : 'opacity-100 grayscale-0'}
              `}
                        />
                    </div>

                    {/* Checkmark badge */}
                    {(phase === 'connected') && (
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                            <CheckCircle2 size={24} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <div className="text-center space-y-3">
                    {phase === 'analyzing' && (
                        <div className="flex items-center gap-3 animate-in fade-in duration-300">
                            <Loader2 className="animate-spin" size={20} />
                            <span className="text-lg font-medium">Analyzing your request...</span>
                        </div>
                    )}

                    {phase === 'found' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <p className="text-lg font-medium text-green-400 mb-2">✓ Specialist found!</p>
                            <p className="text-2xl font-bold">{agent.name}</p>
                            <p className="text-sm text-white/70">{agent.role}</p>
                        </div>
                    )}

                    {phase === 'connecting' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex items-center gap-2 justify-center mb-2">
                                <span className="text-lg font-medium">Connecting to</span>
                                <span className="text-xl font-bold text-green-400">{agent.name}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-center">
                                <ArrowRight className="animate-pulse" size={16} />
                                <span className="text-sm text-white/70">Initializing secure session...</span>
                            </div>
                        </div>
                    )}

                    {phase === 'connected' && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <p className="text-2xl font-bold text-green-400">Connected!</p>
                            <p className="text-sm text-white/70 mt-1">{agent.name} is ready to help you</p>
                        </div>
                    )}
                </div>

                {/* Progress dots */}
                <div className="flex gap-2 mt-8">
                    {['analyzing', 'found', 'connecting', 'connected'].map((p, i) => (
                        <div
                            key={p}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${phase === p
                                    ? 'bg-white scale-125'
                                    : ['analyzing', 'found', 'connecting', 'connected'].indexOf(phase) > i
                                        ? 'bg-green-500'
                                        : 'bg-white/30'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
