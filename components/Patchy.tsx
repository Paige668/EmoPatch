import React, { useId } from 'react';

// Patchy is the purple fabric patch from the home-screen logo, given a
// face. Each mood belongs to a fixed moment in the flow:
//   idle     — resting on a screen       thinking — while the AI works
//   found    — a pattern or piece found  comfort  — perspectives, pauses, safety
//   cheer    — all steps done            hug, breathe — inside Patchy's pause
export type PatchyMood = 'idle' | 'thinking' | 'found' | 'comfort' | 'cheer' | 'hug' | 'breathe';

const PIECE = 'M28 34H47C47 34 42 18 62 18C82 18 77 34 77 34H94Q102 34 102 42V58C102 58 118 53 118 73C118 93 102 88 102 88V104Q102 112 94 112H28Q20 112 20 104V42Q20 34 28 34Z';
const INK = '#4A3F55';

const closedHappy = (
  <g fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round">
    <path d="M44 72Q49 65 54 72" /><path d="M67 72Q72 65 77 72" />
  </g>
);
const softSmile = <path d="M55.5 81Q60.5 85 65.5 81" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />;

const EYES: Record<PatchyMood, React.ReactNode> = {
  idle: (
    <g className="patchy-blink" fill={INK}>
      <ellipse cx="49" cy="70" rx="4.3" ry="5.8" /><ellipse cx="72" cy="70" rx="4.3" ry="5.8" />
      <circle cx="50.5" cy="67.6" r="1.4" fill="#fff" /><circle cx="73.5" cy="67.6" r="1.4" fill="#fff" />
    </g>
  ),
  thinking: <g fill={INK}><ellipse cx="52" cy="67" rx="4" ry="5.4" /><ellipse cx="75" cy="67" rx="4" ry="5.4" /></g>,
  found: (
    <g fill={INK}>
      <circle cx="49" cy="69" r="6.4" /><circle cx="72" cy="69" r="6.4" />
      <circle cx="51.2" cy="66.6" r="2.2" fill="#fff" /><circle cx="74.2" cy="66.6" r="2.2" fill="#fff" />
    </g>
  ),
  comfort: closedHappy,
  cheer: closedHappy,
  hug: closedHappy,
  breathe: (
    <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round">
      <path d="M44 70Q49 74.5 54 70" /><path d="M67 70Q72 74.5 77 70" />
    </g>
  ),
};

const MOUTH: Record<PatchyMood, React.ReactNode> = {
  idle: <path d="M55.5 81Q60.5 86 65.5 81" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />,
  thinking: <circle cx="63" cy="83" r="2.6" fill={INK} />,
  found: <path d="M54.5 79Q60.5 91 66.5 79Z" fill={INK} />,
  comfort: softSmile,
  cheer: <path d="M53 78Q60.5 94 68 78Z" fill={INK} />,
  hug: softSmile,
  breathe: <path d="M57.5 83H63.5" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />,
};

const AROUND: Partial<Record<PatchyMood, React.ReactNode>> = {
  thinking: (
    <g fill="#B79FD4">
      <circle className="patchy-dot" cx="110" cy="30" r="3" />
      <circle className="patchy-dot" cx="118" cy="20" r="3.6" />
      <circle className="patchy-dot" cx="125" cy="9" r="4.2" />
    </g>
  ),
  found: (
    <>
      <path className="patchy-spark" d="M112 14l2.4 6.6 6.6 2.4-6.6 2.4-2.4 6.6-2.4-6.6-6.6-2.4 6.6-2.4z" fill="#F4D06F" />
      <path className="patchy-spark" style={{ animationDelay: '.5s' }} d="M14 20l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="#8AB89F" />
    </>
  ),
  comfort: <path className="patchy-heart" d="M112 30s-8-5-8-10.5a4.4 4.4 0 0 1 8-2.6 4.4 4.4 0 0 1 8 2.6C120 25 112 30 112 30z" fill="#E08D79" />,
  cheer: (
    <g>
      <rect className="patchy-confetti" x="12" y="10" width="5" height="9" rx="1.5" fill="#F4D06F" />
      <rect className="patchy-confetti" x="104" y="6" width="5" height="9" rx="1.5" fill="#8AB89F" />
      <rect className="patchy-confetti" x="30" y="2" width="5" height="9" rx="1.5" fill="#E08D79" />
      <rect className="patchy-confetti" x="118" y="16" width="5" height="9" rx="1.5" fill="#B79FD4" />
    </g>
  ),
};

const HUG_FRONT = (
  <>
    <path d="M61 110s-10.5-6.8-10.5-14a5.6 5.6 0 0 1 10.5-3.2 5.6 5.6 0 0 1 10.5 3.2c0 7.2-10.5 14-10.5 14z" fill="#E08D79" />
    <g fill="none" stroke="#9C82C2" strokeWidth={8} strokeLinecap="round">
      <path d="M23 84Q33 103 51 99" /><path d="M99 84Q89 103 71 99" />
    </g>
  </>
);

const MOTION: Partial<Record<PatchyMood, string>> = { cheer: 'patchy-cheer', hug: 'patchy-hug' };

interface PatchyProps {
  mood?: PatchyMood;
  // Extra motion layered on top of the mood, e.g. "patchy-breathing" or "patchy-sway".
  motion?: string;
  className?: string;
  label?: string;
}

export const Patchy: React.FC<PatchyProps> = ({ mood = 'idle', motion = '', className = 'w-20', label }) => {
  // useId() contains colons, which some browsers reject inside url(#…).
  const gradientId = `patchy${useId().replace(/:/g, '')}`;
  return (
    <span className={`patchy inline-block shrink-0 ${MOTION[mood] || ''} ${motion} ${className}`}>
      <svg viewBox="0 0 130 124" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#DCCEED" /><stop offset="1" stopColor="#B79FD4" />
          </linearGradient>
        </defs>
        {AROUND[mood]}
        <g className="patchy-body">
          <path d={PIECE} fill={`url(#${gradientId})`} />
          <path d={PIECE} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="5 5" opacity={0.9} transform="translate(6.4 7) scale(.9)" />
          <circle cx="40" cy="82" r="5.5" fill="#F3A5A0" opacity={0.55} />
          <circle cx="81" cy="82" r="5.5" fill="#F3A5A0" opacity={0.55} />
          {EYES[mood]}
          {MOUTH[mood]}
          {mood === 'hug' && HUG_FRONT}
        </g>
      </svg>
    </span>
  );
};

// Patchy with a speech bubble beside it.
export const PatchyGuide: React.FC<{ mood?: PatchyMood; children: React.ReactNode; className?: string }> = ({ mood = 'idle', children, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <Patchy mood={mood} className="w-[68px]" />
    <div key={String(children)} className="pop relative min-w-0 flex-1 rounded-[1.25rem] bg-white px-4 py-2.5 font-display text-[15px] leading-relaxed text-[#6A5283] shadow-[4px_4px_10px_rgba(150,140,120,0.28)]" role="status">
      <span aria-hidden="true" className="absolute -left-1.5 top-1/2 -mt-[7px] h-3.5 w-3.5 rotate-45 rounded-[3px] bg-white" />
      <span className="relative">{children}</span>
    </div>
  </div>
);
