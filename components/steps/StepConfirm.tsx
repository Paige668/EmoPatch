
import React from 'react';
import { ClayButton } from '../ui/ClayButton';
import { ClayTag } from '../ui/ClayTag';
import { Icon, IconBadge, type IconName } from '../ui/Icon';
import { FallbackNotice } from '../FallbackNotice';
import { PatchyGuide } from '../Patchy';
import { EMOTIONAL_NEEDS, PATTERN_ICON, type UIText } from '../../constants';
import { Language } from '../../types';
import type { TriageData } from '../../hooks/useTriageFlow';

interface StepConfirmProps {
  t: UIText;
  data: TriageData;
  language: Language;
  fallbackMessage: string | null;
  onRetry?: () => void;
  patternContent?: { title: string; body: string };

  // Custom Needs State
  customNeedInput: string;
  setCustomNeedInput: (val: string) => void;
  isAddingNeed: boolean;
  setIsAddingNeed: (val: boolean) => void;
  handleAddCustomNeed: () => void;

  actions: {
    updateSplit: (updates: { fact?: string; interpretation?: string }) => void;
    setClarifyingAnswer: (answer: string) => void;
    toggleNeed: (need: string) => void;
    confirmSplit: () => void;
    startGrounding: () => void;
  };
}

interface PieceFieldProps {
  id: string;
  label: string;
  hint: string;
  icon: IconName;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  charsPerLine: number;
  className: string;
  textClassName: string;
}

// One editable puzzle piece: the fact and the story interlock, because the
// story is something the mind built on top of the fact.
const PieceField: React.FC<PieceFieldProps> = ({ id, label, hint, icon, value, placeholder, onChange, charsPerLine, className, textClassName }) => (
  <div className={`piece ${className}`}>
    <div className="relative flex flex-wrap items-center gap-2 mb-2 text-[13px] font-extrabold text-[var(--piece-ink)]">
      <IconBadge name={icon} size="sm" className="text-[var(--piece-ink)]" />
      <label htmlFor={id}>{label}</label>
      <span className="text-xs font-semibold opacity-75">· {hint}</span>
    </div>
    <textarea
      id={id}
      className={`relative w-full bg-transparent border-none p-0 leading-relaxed focus:ring-0 focus:outline-none resize-none placeholder-[#A39E96] ${textClassName}`}
      // Size to the content so a one-line story doesn't sit in a mostly empty box.
      rows={Math.min(5, Math.max(2, Math.ceil((value || '').length / charsPerLine)))}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export const StepConfirm: React.FC<StepConfirmProps> = ({
  t,
  data,
  language,
  fallbackMessage,
  onRetry,
  patternContent,
  customNeedInput,
  setCustomNeedInput,
  isAddingNeed,
  setIsAddingNeed,
  handleAddCustomNeed,
  actions
}) => {
  const charsPerLine = language === 'zh' ? 18 : 38;
  const answered = data.clarifyingAnswer.trim().length > 0;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-[26px] text-[#4A4A4A] text-center">{t.step_confirm_title}</h2>

      <PatchyGuide mood={answered ? 'found' : 'idle'}>
        {answered ? t.confirm_bubble_found : t.confirm_bubble}
      </PatchyGuide>

      {data.isFallback && (
        <FallbackNotice message={fallbackMessage} retryLabel={t.retry_button} onRetry={onRetry} />
      )}

      {data.thinkingPattern && patternContent && (
        <div className="flex items-center gap-3 rounded-[1.4rem] bg-gradient-to-br from-[#FFF8E6] to-[#FFF1CC] px-4 py-3 shadow-[5px_5px_12px_rgba(150,140,120,0.28),-5px_-5px_12px_#FFFFFF]">
          <IconBadge name={PATTERN_ICON[data.thinkingPattern]} size="lg" className="text-[#85651A]" />
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold tracking-wide text-[#85651A]">{t.pattern_notice_label}</div>
            <div className="font-display text-lg text-[#6E5310]">{patternContent.title}</div>
            <p className="text-[13px] text-[#7A6A3A] leading-relaxed">{patternContent.body}</p>
          </div>
        </div>
      )}

      <div className="piece-stack snap-in">
        <PieceField
          id="split-fact"
          label={t.fact_label}
          hint={t.fact_hint}
          icon="camera"
          value={data.fact}
          placeholder={t.fact_placeholder}
          onChange={(fact) => actions.updateSplit({ fact })}
          charsPerLine={charsPerLine}
          className="piece-knob"
          textClassName="text-[17px] font-medium text-[#4A4A4A]"
        />
        <PieceField
          id="split-story"
          label={t.interpretation_label}
          hint={t.interpretation_hint}
          icon="thought"
          value={data.interpretation}
          placeholder={t.interpretation_placeholder}
          onChange={(interpretation) => actions.updateSplit({ interpretation })}
          charsPerLine={charsPerLine}
          className="piece-yellow piece-socket"
          textClassName="font-display !font-normal text-lg text-[#5A4A1E]"
        />
      </div>

      {data.unknowns.length > 0 && (
        <div className="rounded-[1.6rem] bg-gradient-to-br from-[#FFFDF9] to-[#F6F2EA] p-4 shadow-[6px_6px_14px_rgba(150,140,120,0.28),-6px_-6px_14px_#FFFFFF]">
          <div className="flex flex-wrap items-baseline gap-2 mb-2.5 text-[13px] font-extrabold text-[#6A5283]">
            {t.unknowns_label}
            <span className="text-xs font-semibold opacity-75">· {t.unknowns_hint}</span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {data.unknowns.map((unknown: string, index: number) => (
              <li
                key={index}
                className="missing-piece flex items-center gap-1.5 rounded-[0.9rem] border-2 border-dashed border-[#B79FD4]/75 bg-[#EFE8F7] px-3 py-1.5 text-[13px] font-bold text-[#5D5268]"
              >
                <Icon name="puzzle" className="w-[15px] h-[15px] shrink-0" />
                <span>{unknown}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.clarifyingQuestion && (
        <div className="rounded-[1.6rem] bg-gradient-to-br from-[#EFE8F7] to-[#E6DAF3] p-4 shadow-[6px_6px_14px_rgba(150,140,120,0.28),-6px_-6px_14px_#FFFFFF]">
          <div className="flex items-center gap-2 mb-2 text-[13px] font-extrabold text-[#6A5283]">
            <IconBadge name="question" size="sm" />
            {t.missing_piece_label}
          </div>
          <p className="font-extrabold text-[#4F4560]">{data.clarifyingQuestion}</p>
          {data.clarifyingWhy && (
            <p className="text-xs text-[#6A5283] leading-relaxed mt-0.5">
              <span className="font-black">{t.missing_piece_why}</span> {data.clarifyingWhy}
            </p>
          )}
          <textarea
            value={data.clarifyingAnswer}
            onChange={(event) => actions.setClarifyingAnswer(event.target.value)}
            rows={2}
            aria-label={data.clarifyingQuestion}
            className="mt-3 w-full rounded-2xl bg-white/75 shadow-[inset_2px_2px_5px_rgba(122,96,160,0.15)] border-none p-3.5 text-sm text-[#4A4A4A] resize-none focus:outline-none focus:ring-2 focus:ring-[#B79FD4]/40"
            placeholder={t.missing_piece_placeholder}
          />
        </div>
      )}

      <div className="rounded-[1.6rem] bg-gradient-to-br from-[#FFF0E7] to-[#FFE4D6] p-4 shadow-[6px_6px_14px_rgba(150,140,120,0.28),-6px_-6px_14px_#FFFFFF]">
        <div className="mb-3 text-[13px] font-extrabold text-[#A8481B]">{t.needs_label}</div>
        <div className="flex flex-wrap gap-2 items-center">
          {EMOTIONAL_NEEDS[language].map(need => (
            <ClayTag
              key={need}
              label={need}
              isSelected={data.selectedNeeds.includes(need)}
              onClick={() => actions.toggleNeed(need)}
            />
          ))}

          {data.selectedNeeds
            .filter((n: string) => !EMOTIONAL_NEEDS[language].includes(n))
            .map((need: string) => (
              <ClayTag
                key={need}
                label={need}
                isSelected={true}
                onClick={() => actions.toggleNeed(need)}
              />
            ))
          }

          {isAddingNeed ? (
            <div className="flex items-center bg-white/50 rounded-xl shadow-inner px-3 py-1 border border-[#E08D79]">
              <input
                autoFocus
                className="bg-transparent border-none outline-none text-sm text-[#C05621] w-24 font-bold placeholder-[#E08D79]/50"
                value={customNeedInput}
                onChange={e => setCustomNeedInput(e.target.value)}
                placeholder={t.add_need_placeholder}
                aria-label={t.add_need_aria}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddCustomNeed();
                  if (e.key === 'Escape') setIsAddingNeed(false);
                }}
                onBlur={handleAddCustomNeed}
              />
            </div>
          ) : (
            <button
              type="button"
              aria-label={t.add_need_aria}
              onClick={() => setIsAddingNeed(true)}
              className="squish w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#FFF5F2] text-[#E08D79] border-2 border-dashed border-[#E08D79]/40 hover:border-[#E08D79] hover:bg-[#E08D79] hover:text-white"
            >
              +
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 pb-4">
        <ClayButton variant="secondary" onClick={actions.startGrounding} className="gap-1.5 !text-[#3F6B52]">
          <Icon name="wind" className="w-[18px] h-[18px]" />{t.grounding_button}
        </ClayButton>
        <ClayButton onClick={actions.confirmSplit} className="gap-1.5">
          {t.confirm_button}
        </ClayButton>
      </div>
    </div>
  );
};
