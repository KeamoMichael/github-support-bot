import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Calendar } from 'lucide-react';
import { RateLimitState } from '../types';

interface RateLimitNotificationProps {
    rateLimitState: RateLimitState;
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({ rateLimitState }) => {
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    useEffect(() => {
        if (!rateLimitState.resetTime) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const resetTime = new Date(rateLimitState.resetTime!).getTime();
            const diff = resetTime - now;

            if (diff <= 0) {
                setTimeRemaining('Ready to resume');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            } else if (minutes > 0) {
                setTimeRemaining(`${minutes}m ${seconds}s`);
            } else {
                setTimeRemaining(`${seconds}s`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [rateLimitState.resetTime]);

    if (!rateLimitState.isLimited) return null;

    const getIconAndColor = () => {
        switch (rateLimitState.limitType) {
            case 'RPD':
                return { icon: Calendar, color: 'from-red-500 to-orange-500', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
            case 'RPM':
                return { icon: Clock, color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
            case 'TPM':
                return { icon: AlertCircle, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' };
            default:
                return { icon: AlertCircle, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200' };
        }
    };

    const { icon: Icon, color, bgColor, textColor, borderColor } = getIconAndColor();

    const getLimitTypeLabel = () => {
        switch (rateLimitState.limitType) {
            case 'RPD': return 'Daily Limit Reached';
            case 'RPM': return 'Rate Limit (Per Minute)';
            case 'TPM': return 'Token Limit (Per Minute)';
            default: return 'Rate Limit Reached';
        }
    };

    return (
        <div className={`${bgColor} ${borderColor} border-2 rounded-2xl p-6 my-4 animate-in fade-in slide-in-from-top-2 duration-500`}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={24} />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-bold ${textColor}`}>
                            {getLimitTypeLabel()}
                        </h3>
                        {rateLimitState.resetTime && (
                            <div className={`px-3 py-1 rounded-full ${bgColor} border ${borderColor} font-mono text-sm font-bold ${textColor}`}>
                                {timeRemaining}
                            </div>
                        )}
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-3">
                        {rateLimitState.message || 'You have reached your API usage limit. Please wait before sending more messages.'}
                    </p>

                    {rateLimitState.limitType === 'RPD' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Daily limit exceeded.</strong> To continue using the service today, consider upgrading your API plan.
                            </p>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-block px-4 py-2 bg-gradient-to-r ${color} text-white rounded-full text-sm font-bold hover:shadow-lg transition-all duration-200 hover:scale-105`}
                            >
                                Upgrade API Plan
                            </a>
                        </div>
                    )}

                    {(rateLimitState.limitType === 'RPM' || rateLimitState.limitType === 'TPM') && (
                        <div className="mt-3 text-sm text-gray-600">
                            💡 <strong>Tip:</strong> You can send your next message in {timeRemaining}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
