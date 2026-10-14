import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioRecorderProps {
  onStop: (audioBlob: Blob) => void;
  onError?: (error: Error) => void;
  maxDurationMs?: number;
}

// Keeps uploads well under the serverless request limit.
const DEFAULT_MAX_DURATION_MS = 2 * 60 * 1000;

export const useAudioRecorder = ({ onStop, onError, maxDurationMs = DEFAULT_MAX_DURATION_MS }: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoStop = () => {
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    autoStopRef.current = null;
  };

  const stopRecording = useCallback(() => {
    clearAutoStop();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Safari records audio/mp4, Chrome and Firefox record webm/ogg.
        // Keep the recorder's real container type so transcription can decode it.
        const mimeType = mediaRecorder.mimeType || audioChunksRef.current[0]?.type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
        onStop(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      autoStopRef.current = setTimeout(stopRecording, maxDurationMs);
    } catch (err: any) {
      console.error("Mic error:", err);
      if (onError) onError(err);
    }
  }, [onStop, onError, maxDurationMs, stopRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => clearAutoStop, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording
  };
};
