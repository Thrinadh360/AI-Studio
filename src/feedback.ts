/**
 * Native Hardware Feedback Utility: Voice Synthesis & Haptic Vibration Patterns
 */

export const playHaptic = (style: 'success' | 'error' | 'warning' | 'tap' | 'heavy' | 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      switch (style) {
        case 'success':
          navigator.vibrate([40, 80, 40]);
          break;
        case 'error':
          navigator.vibrate([100, 50, 100, 50, 150]);
          break;
        case 'warning':
          navigator.vibrate([80, 40, 80]);
          break;
        case 'light':
        case 'tap':
          navigator.vibrate(15);
          break;
        case 'heavy':
          navigator.vibrate(60);
          break;
        default:
          navigator.vibrate(20);
          break;
      }
    } catch (e) {
      // Ignore vibration errors (safeguard for browser permission blocks)
    }
  }
};

export const playVoice = (text: string) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      // Cancel previous speakings for zero overlap latency
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05; // Slightly faster for slick native feedback response
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      // Attempt to find a suitable English voice preference
      const voices = window.speechSynthesis.getVoices();
      const preferredNo = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Apple'))
      );
      if (preferredNo) {
        utterance.voice = preferredNo;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Voice synthesis failed:', e);
    }
  }
};
