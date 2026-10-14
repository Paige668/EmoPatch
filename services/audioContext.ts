let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    // A standard sample rate works for browser-decoded MP3 returned by the TTS endpoint.
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Ensure context is running (browsers might suspend it if created before interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(e => console.warn("Audio Context resume failed", e));
  }
  
  return audioContext;
};
