import React, { useState } from 'react';
import { ClayCard } from '../ClayCard';
import { ClayButton } from '../ui/ClayButton';
import { Icon } from '../ui/Icon';
import { Patchy } from '../Patchy';
import type { UIText } from '../../constants';
import type { Language } from '../../types';
import type { TriageData } from '../../hooks/useTriageFlow';
import { DEMO_CASES } from '../../services/demoCase';

interface StepContextPatchProps {
  t: UIText;
  data: TriageData;
  language: Language;
  actions: {
    submitContextPatch: (context: string) => void;
  };
}

export const StepContextPatch: React.FC<StepContextPatchProps> = ({ t, data, language, actions }) => {
  // Opening the step clears the input; after a failed update it is restored for retry.
  const [context, setContext] = useState(data.contextPatchInput || '');
  const sampleContext = data.isDemo && data.versions.length === 1 ? DEMO_CASES[language].sampleContext : null;

  return (
    <div>
      <div className="text-center mb-6">
        <Patchy mood="found" className="w-20 mb-2" />
        <h2 className="font-display text-[26px] text-[#4A4A4A] mb-2">{t.context_patch_title}</h2>
        <p className="text-sm text-[#6B6B6B] font-semibold leading-relaxed px-3">{t.context_patch_hint}</p>
      </div>

      {sampleContext && !context && (
        <button
          type="button"
          onClick={() => setContext(sampleContext)}
          className="mb-4 w-full rounded-2xl bg-[#F4EFF8] border border-[#B79FD4]/40 px-4 py-3 text-left text-xs text-[#6A5283] hover:bg-[#EAE0F2] transition-colors"
        >
          <span className="flex items-center gap-1 font-black mb-1"><Icon name="puzzle" className="w-4 h-4" />{t.context_patch_sample}</span>
          <span className="block leading-relaxed">“{sampleContext}”</span>
        </button>
      )}

      <ClayCard className="mb-5">
        <textarea
          autoFocus
          value={context}
          onChange={(event) => setContext(event.target.value)}
          rows={7}
          maxLength={12000}
          aria-label={t.context_patch_title}
          placeholder={t.context_patch_placeholder}
          className="w-full bg-transparent border-none p-0 text-[#4A4A4A] text-base leading-relaxed resize-none focus:outline-none"
        />
      </ClayCard>

      {data.contextPatchError && (
        <p role="alert" className="mb-4 rounded-xl bg-[#FFF4E5] border border-[#FFD8A8] px-4 py-3 text-xs font-bold text-[#A8481B]">
          {data.contextPatchError}
        </p>
      )}

      <ClayButton
        onClick={() => actions.submitContextPatch(context.trim())}
        disabled={!context.trim()}
        className="w-full"
      >
        {t.context_patch_submit}
      </ClayButton>
    </div>
  );
};
