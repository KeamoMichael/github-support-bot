import { useCallback, useRef } from 'react';

// Web Audio API based sound effects - no external files needed
export const useChatSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Pleasant connection chime - ascending notes
  const playConnected = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Create a pleasant two-tone ascending chime
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
      
      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now + i * 0.12);
        
        gainNode.gain.setValueAtTime(0, now + i * 0.12);
        gainNode.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.4);
        
        oscillator.start(now + i * 0.12);
        oscillator.stop(now + i * 0.12 + 0.5);
      });
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [getAudioContext]);

  // Soft disconnection tone - descending
  const playDisconnected = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Descending soft tone
      const frequencies = [523.25, 392.00]; // C5, G4
      
      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now + i * 0.2);
        
        gainNode.gain.setValueAtTime(0, now + i * 0.2);
        gainNode.gain.linearRampToValueAtTime(0.1, now + i * 0.2 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.5);
        
        oscillator.start(now + i * 0.2);
        oscillator.stop(now + i * 0.2 + 0.6);
      });
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [getAudioContext]);

  // Subtle message received sound
  const playMessageReceived = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now); // A5
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [getAudioContext]);

  return {
    playConnected,
    playDisconnected,
    playMessageReceived
  };
};
