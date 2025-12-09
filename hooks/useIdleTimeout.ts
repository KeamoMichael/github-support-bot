import { useState, useEffect, useCallback, useRef } from 'react';

interface UseIdleTimeoutOptions {
    warningTimeMs?: number;  // Time before showing warning (default: 3 minutes)
    timeoutMs?: number;      // Time before auto-disconnect (default: 5 minutes)
    onWarning?: () => void;
    onTimeout?: () => void;
    enabled?: boolean;
}

export const useIdleTimeout = ({
    warningTimeMs = 3 * 60 * 1000, // 3 minutes
    timeoutMs = 5 * 60 * 1000,     // 5 minutes
    onWarning,
    onTimeout,
    enabled = true
}: UseIdleTimeoutOptions = {}) => {
    const [showWarning, setShowWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(timeoutMs);
    const [isTimedOut, setIsTimedOut] = useState(false);

    const lastActivityRef = useRef<number>(Date.now());
    const warningShownRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        warningShownRef.current = false;
        setShowWarning(false);
        setIsTimedOut(false);
        setTimeRemaining(timeoutMs);
    }, [timeoutMs]);

    const handleActivity = useCallback(() => {
        if (!isTimedOut) {
            resetTimer();
        }
    }, [resetTimer, isTimedOut]);

    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        // Reset on enable
        resetTimer();

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - lastActivityRef.current;
            const remaining = Math.max(0, timeoutMs - elapsed);
            setTimeRemaining(remaining);

            // Show warning
            if (elapsed >= warningTimeMs && !warningShownRef.current) {
                warningShownRef.current = true;
                setShowWarning(true);
                onWarning?.();
            }

            // Timeout
            if (elapsed >= timeoutMs) {
                setIsTimedOut(true);
                setShowWarning(false);
                onTimeout?.();
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, warningTimeMs, timeoutMs, onWarning, onTimeout, resetTimer]);

    const dismissWarning = useCallback(() => {
        setShowWarning(false);
        resetTimer();
    }, [resetTimer]);

    return {
        showWarning,
        isTimedOut,
        timeRemaining,
        resetTimer: handleActivity,
        dismissWarning,
        formatTimeRemaining: () => {
            const seconds = Math.ceil(timeRemaining / 1000);
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    };
};
