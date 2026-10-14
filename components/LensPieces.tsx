import React from 'react';
import { IconBadge, Icon } from './ui/Icon';
import { LeadText } from './LeadText';
import { PERSONA_LABELS, type UIText } from '../constants';
import { ReframeType, type Language, type PerspectiveSet } from '../types';

const LENSES = [
  { type: ReframeType.OBSERVER, piece: '' },
  { type: ReframeType.POSSIBILITIES, piece: 'piece-yellow' },
  { type: ReframeType.AGENCY, piece: 'piece-purple' },
];
const lensKey = (type: ReframeType) => type.toLowerCase() as keyof PerspectiveSet;

interface LensPiecesProps {
  t: UIText;
  language: Language;
  reframes: PerspectiveSet;
  // When set, each piece also shows the previous version's text for comparison.
  previous?: PerspectiveSet;
  onSelect: (type: string, content: string) => void;
}

// The three perspectives as one column of interlocking pieces: three sides of
// the same situation rather than three unrelated options.
export const LensPieces: React.FC<LensPiecesProps> = ({ t, language, reframes, previous, onSelect }) => (
  <div className="piece-stack snap-in">
    {LENSES.map(({ type, piece }, index) => {
      const label = PERSONA_LABELS[language][type];
      const content = reframes[lensKey(type)] || '';
      const select = () => onSelect(type, content);
      return (
        <div
          key={type}
          role="button"
          tabIndex={0}
          onClick={select}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              select();
            }
          }}
          className={`piece piece-clickable ${piece} ${index < LENSES.length - 1 ? 'piece-knob' : ''} ${index > 0 ? 'piece-socket' : ''}`}
        >
          <div className="relative flex items-center gap-2.5 mb-2">
            {label.icon && <IconBadge name={label.icon} size="sm" className="text-[var(--piece-ink)]" />}
            <span className="text-[13px] font-extrabold text-[var(--piece-ink)]">{label.title}</span>
            <Icon name="arrow" className="ml-auto w-[18px] h-[18px] text-[var(--piece-ink)]" />
          </div>
          {previous && (
            <p className="relative text-xs text-[#757575] leading-relaxed mb-2 pl-3 border-l-2 border-white/80">
              <span className="font-black">{t.patch_before}: </span>{previous[lensKey(type)]}
            </p>
          )}
          <div className="relative">
            <LeadText text={content} moreLabel={t.show_more} lessLabel={t.show_less} leadClassName="text-[#4A4A4A] font-extrabold text-[17px]" />
          </div>
        </div>
      );
    })}
  </div>
);

// "Actually, there's more context…": adding a missing piece to the analysis.
export const AddContextButton: React.FC<{ label: string; onClick: () => void; className?: string }> = ({ label, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`squish w-full flex items-center justify-center gap-2 rounded-[1.4rem] border-2 border-dashed border-[#B79FD4]/70 bg-[#EFE8F7] px-5 py-4 text-sm font-black text-[#6A5283] hover:bg-[#E6DAF3] ${className}`}
  >
    <Icon name="puzzle" className="w-[18px] h-[18px]" />
    {label}
  </button>
);
