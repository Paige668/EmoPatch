import React, { useState } from 'react';
import { ClayButton } from '../ui/ClayButton';
import { Icon } from '../ui/Icon';
import { PatchyGuide } from '../Patchy';
import { LensPieces } from '../LensPieces';
import type { UIText } from '../../constants';
import { Language } from '../../types';
import type { TriageData } from '../../hooks/useTriageFlow';

interface StepPatchResultProps {
  t: UIText;
  data: TriageData;
  language: Language;
  actions: {
    selectReframe: (type: string, content: string) => void;
    openContextPatch: () => void;
    reset: () => void;
  };
}

const SummaryList = ({ title, items, tone }: { title: string; items: string[]; tone: 'changed' | 'stayed' }) => (
  <div className={`rounded-2xl p-4 ${tone === 'changed' ? 'bg-[#FDEBE2]' : 'bg-[#E3F0E6]'}`}>
    <h3 className={`text-xs font-black uppercase tracking-wider mb-2 ${tone === 'changed' ? 'text-[#A8481B]' : 'text-[#3F6B52]'}`}>
      {title}
    </h3>
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-[#4A4A4A] flex gap-2">
          <span aria-hidden="true">{tone === 'changed' ? '↻' : '✓'}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const StepPatchResult: React.FC<StepPatchResultProps> = ({ t, data, language, actions }) => {
  const [showPrevious, setShowPrevious] = useState(false);
  const patch = data.lastPatch;
  if (!patch) return null;

  const versionNumber = data.versions.length;
  const previous = data.versions[versionNumber - 2];

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="font-display text-[26px] text-[#4A4A4A]">{t.patch_title}</h2>
        {versionNumber > 1 && (
          <p className="text-xs font-bold text-[#6A5283] mt-1">
            {t.patch_version.replace('{n}', String(versionNumber))}
          </p>
        )}
      </div>
      <PatchyGuide mood="found" className="mb-5">{patch.changeSummary.why}</PatchyGuide>

      <div className="space-y-4 mb-7">
        {/* The headline diff: how the story itself moved */}
        {previous && (
          <div className="rounded-3xl bg-white/70 border border-white p-5 shadow-[6px_6px_14px_#DED9D4,-6px_-6px_14px_#FFFFFF]">
            <h3 className="text-[#7A5F1A] text-xs font-black uppercase tracking-wider mb-3">{t.patch_story_label}</h3>
            <p className="text-sm text-[#757575] leading-relaxed line-through decoration-[#C0654F]/40">
              <span className="sr-only">{t.patch_before}: </span>{previous.interpretation}
            </p>
            <p aria-hidden="true" className="text-[#B79FD4] my-1">↓</p>
            <p className="text-sm text-[#4A4A4A] font-semibold leading-relaxed">
              <span className="sr-only">{t.patch_after}: </span>{patch.updatedInterpretation}
            </p>
          </div>
        )}

        <div className="rounded-3xl bg-[#FBF7F2] border border-white p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SummaryList title={t.context_patch_changed} items={patch.changeSummary.changed} tone="changed" />
            <SummaryList title={t.context_patch_stayed} items={patch.changeSummary.stayed} tone="stayed" />
          </div>
        </div>

        <details className="rounded-3xl bg-white/40 border border-white p-5">
          <summary className="cursor-pointer text-xs font-black uppercase tracking-wider text-[#3F6B52]">{t.patch_updated_fact}</summary>
          <p className="text-sm text-[#4A4A4A] leading-relaxed mt-3">{patch.updatedFact}</p>
          {patch.unknowns.length > 0 && (
            <>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#6A5283] mt-4 mb-2">{t.unknowns_label}</h4>
              <ul className="flex flex-wrap gap-2">
                {patch.unknowns.map((unknown, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-dashed border-[#B79FD4]/60 bg-[#F7F2FB] px-3 py-1.5 text-sm text-[#5D5268]"
                  >
                    <Icon name="puzzle" className="w-[15px] h-[15px] shrink-0" />
                    <span>{unknown}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </details>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="font-display text-xl text-[#4A4A4A]">{t.choice_title}</h3>
        {previous && (
          <button
            type="button"
            onClick={() => setShowPrevious(value => !value)}
            aria-expanded={showPrevious}
            className="shrink-0 text-xs font-bold text-[#6A5283] underline decoration-dashed underline-offset-4"
          >
            {showPrevious ? t.patch_compare_hide : t.patch_compare_show}
          </button>
        )}
      </div>
      <LensPieces
        t={t}
        language={language}
        reframes={patch.reframes}
        previous={showPrevious && previous ? previous.reframes : undefined}
        onSelect={actions.selectReframe}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
        <ClayButton variant="secondary" onClick={actions.openContextPatch} className="gap-1.5 !text-[#6A5283]"><Icon name="puzzle" className="w-[18px] h-[18px]" />{t.context_patch_again}</ClayButton>
        <ClayButton onClick={actions.reset}>{t.home_button}</ClayButton>
      </div>
    </div>
  );
};
