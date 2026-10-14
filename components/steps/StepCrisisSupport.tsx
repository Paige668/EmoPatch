import React from 'react';
import { ClayCard } from '../ClayCard';
import { ClayButton } from '../ui/ClayButton';
import { IconBadge } from '../ui/Icon';
import type { UIText } from '../../constants';

interface StepCrisisSupportProps {
  t: UIText;
  actions: {
    goBack: () => void;
  };
}

export const StepCrisisSupport: React.FC<StepCrisisSupportProps> = ({ t, actions }) => (
  <div role="alert" aria-live="assertive">
    <ClayCard className="!from-[#FFF0ED] !to-[#FFF8F6] border-2 !border-[#E08D79]">
      <div className="text-center">
        <div className="inline-flex mb-4"><IconBadge name="heart" size="lg" className="text-[#A8481B]" /></div>
        <h2 className="font-display text-[26px] text-[#8C4E42] mb-4">{t.crisis_title}</h2>
        <p className="text-[#6B514C] font-semibold leading-relaxed mb-5">{t.crisis_body}</p>
        <p className="rounded-2xl bg-white/70 p-4 text-sm font-black text-[#8C4E42] mb-6">{t.crisis_immediate}</p>
        <a
          href="https://findahelpline.com"
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-2xl bg-[#E08D79] px-5 py-4 text-white font-black shadow-md mb-4"
        >
          {t.crisis_helpline} ↗
        </a>
        <ClayButton variant="secondary" onClick={actions.goBack} className="w-full">
          {t.crisis_back}
        </ClayButton>
      </div>
    </ClayCard>
  </div>
);
