let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    // Initialize with 24kHz sample rate to match Gemini's native output
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  
  // Ensure context is running (browsers might suspend it if created before interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(e => console.warn("Audio Context resume failed", e));
  }
  
  return audioContext;
};