
import React from 'react';
import { FallbackNotice } from '../FallbackNotice';
import { PatchyGuide } from '../Patchy';
import { LensPieces, AddContextButton } from '../LensPieces';
import type { UIText } from '../../constants';
import { Language } from '../../types';
import type { TriageData } from '../../hooks/useTriageFlow';

interface StepChoiceProps {
  t: UIText;
  data: TriageData;
  language: Language;
  fallbackMessage: string | null;
  onRetry?: () => void;
  canPatch: boolean;
  actions: {
    selectReframe: (type: string, content: string) => void;
    openContextPatch: () => void;
  };
}

export const StepChoice: React.FC<StepChoiceProps> = ({ t, data, language, fallbackMessage, onRetry, canPatch, actions }) => (
  <div className="space-y-4">
    <h2 className="font-display text-[26px] text-[#4A4A4A] text-center leading-tight">{t.choice_title}</h2>
    <PatchyGuide mood="comfort">{t.choice_note}</PatchyGuide>

    {data.isFallback && (
      <FallbackNotice message={fallbackMessage} retryLabel={t.retry_button} onRetry={onRetry} />
    )}

    {data.reframes && (
      <LensPieces t={t} language={language} reframes={data.reframes} onSelect={actions.selectReframe} />
    )}

    {canPatch && <AddContextButton label={t.context_patch_button} onClick={actions.openContextPatch} className="!mt-6" />}
  </div>
);
