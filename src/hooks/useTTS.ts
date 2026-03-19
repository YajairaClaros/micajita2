import { useCallback } from 'react';

export function useTTS() {
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Slightly slower for better clarity
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakOnClick = useCallback((text: string, callback?: () => void) => {
    speak(text);
    if (callback) callback();
  }, [speak]);

  return { speak, speakOnClick };
}
