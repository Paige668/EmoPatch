import React, { useState } from 'react';

// Splits model text into its first sentence and the rest. The prompts ask for a
// self-contained lead sentence, so the point reads at a glance and the detail
// stays one tap away.
export const splitLead = (text: string): [string, string] => {
  const trimmed = text.trim();
  const match = trimmed.match(/^([\s\S]+?(?:[。！？!?]|\.(?=\s|$))[”"’]?)\s*([\s\S]*)$/);
  return match ? [match[1], match[2]] : [trimmed, ''];
};

interface LeadTextProps {
  text: string;
  moreLabel: string;
  lessLabel: string;
  leadClassName?: string;
}

export const LeadText: React.FC<LeadTextProps> = ({ text, moreLabel, lessLabel, leadClassName = 'text-base font-bold text-[#4A4A4A]' }) => {
  const [open, setOpen] = useState(false);
  const [lead, rest] = splitLead(text);

  return (
    <div>
      <p className={`leading-snug ${leadClassName}`}>{lead}</p>
      {rest && open && <p className="text-sm text-[#5D5D5D] leading-relaxed mt-2">{rest}</p>}
      {rest && (
        <button
          type="button"
          aria-expanded={open}
          // The text often sits inside a clickable card; expanding must not select it.
          onClick={(event) => { event.stopPropagation(); setOpen(value => !value); }}
          onKeyDown={(event) => event.stopPropagation()}
          className="mt-2 text-xs font-bold text-[#6A5283] underline decoration-dashed underline-offset-4"
        >
          {open ? lessLabel : `${moreLabel} ▾`}
        </button>
      )}
    </div>
  );
};
