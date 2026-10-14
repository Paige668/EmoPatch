import React from 'react';
import { Icon } from './ui/Icon';

interface FallbackNoticeProps {
  message: string | null;
  retryLabel: string;
  onRetry?: () => void;
}

// Shown whenever a step is displaying template content instead of AI output.
export const FallbackNotice: React.FC<FallbackNoticeProps> = ({ message, retryLabel, onRetry }) => {
  if (!message) return null;
  return (
    <div role="status" className="mb-4 bg-[#FFF4E5] border border-[#FFD8A8] text-[#A8481B] px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between gap-3">
      <span className="flex items-start gap-2">
        <Icon name="bolt" className="w-4 h-4 shrink-0" />
        <span>{message}</span>
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="squish shrink-0 inline-flex items-center gap-1 rounded-full bg-white/80 border border-[#FFD8A8] px-3 py-1.5 text-[#A8481B] hover:bg-white"
        >
          <Icon name="retry" className="w-3.5 h-3.5" />{retryLabel}
        </button>
      )}
    </div>
  );
};
