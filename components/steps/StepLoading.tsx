import React from 'react';
import { Patchy } from '../Patchy';
import type { UIText } from '../../constants';

interface StepLoadingProps {
  t: UIText;
  isOfflineMode: boolean;
  canSkip?: boolean;
  actions: {
    skipLoading: () => void;
  };
}

const PIECES = ['from-[#A9D2BA] to-[#8AB89F]', 'from-[#FFE59E] to-[#F4D06F]', 'from-[#DCCEED] to-[#B79FD4]'];

export const StepLoading: React.FC<StepLoadingProps> = ({ t, isOfflineMode, canSkip = true, actions }) => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[50vh]">
    <div className="flex items-end gap-5 mb-10">
      <Patchy mood="thinking" className="w-32" />
      <div className="flex items-end gap-2 pb-4" aria-hidden="true">
        {PIECES.map(colors => (
          <span key={colors} className={`loader-piece block w-6 h-6 rounded-[8px] bg-gradient-to-b ${colors} shadow-[3px_4px_8px_rgba(150,140,120,0.3)]`} />
        ))}
      </div>
    </div>

    <p className="font-display text-lg text-[#6A5283]" role="status">
      {t.buffer_connecting}
    </p>

    {isOfflineMode ? (
      <p className="mt-8 text-xs text-[#C0654F] font-bold">{t.loading_offline}</p>
    ) : canSkip ? (
      <button onClick={actions.skipLoading} className="mt-12 text-xs text-[#8C8C8C] hover:text-[#4A4A4A] underline decoration-dashed transition-colors">
        {t.skip_button}
      </button>
    ) : null}
  </div>
);
