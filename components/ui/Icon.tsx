import React from 'react';

// One line-icon set (24px grid, 2px round strokes) so every platform shows the
// same symbols instead of its own emoji.
const PATHS = {
  camera: <><rect x="3" y="7" width="12" height="10" rx="3" /><path d="M15 11l5-3v8l-5-3" /></>,
  thought: <><path d="M7.5 15.5a4 4 0 0 1 .3-8 5 5 0 0 1 9.4 1.2 3.4 3.4 0 0 1-.7 6.8z" /><circle cx="6" cy="19" r="1.3" /><circle cx="3.6" cy="21.4" r=".7" /></>,
  puzzle: <path d="M4 7.5h4.2a2.6 2.6 0 0 1 5.2 0h4.1v4.1a2.6 2.6 0 0 1 0 5.2v4.2H4z" />,
  question: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.4v.6" /><path d="M12 17h.01" /></>,
  eye: <><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" /><circle cx="12" cy="12" r="2.8" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5.5 5.5" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  wind: <><path d="M3 9h10.5a3 3 0 1 0-3-3" /><path d="M3 15h14a3 3 0 1 1-3 3" /><path d="M3 12h6" /></>,
  speaker: <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="M16.5 9a4.2 4.2 0 0 1 0 6" /></>,
  speakerOn: <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="M16.5 9a4.2 4.2 0 0 1 0 6" /><path d="M19 6.5a8 8 0 0 1 0 11" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0" /><path d="M12 17.5V21" /></>,
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" />,
  image: <><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="8.5" cy="10" r="1.5" /><path d="M21 16l-5-5-8 8" /></>,
  orb: <><circle cx="12" cy="10" r="6.5" /><path d="M9 8.5a3 3 0 0 1 3-2" /><path d="M7 20h10" /><path d="M8.5 16.5L7.5 20M15.5 16.5l1 3.5" /></>,
  mirror: <><ellipse cx="12" cy="9.5" rx="5.5" ry="6.5" /><path d="M12 16v5" /><path d="M9 21h6" /><path d="M9.8 7.2a2.6 2.6 0 0 1 2-1.6" /></>,
  storm: <><path d="M4 6h15" /><path d="M6 10h11" /><path d="M8 14h7" /><path d="M10 18h3" /></>,
  ruler: <><rect x="3" y="8" width="18" height="8" rx="2" /><path d="M7 8v3M11 8v4M15 8v3M19 8v2" /></>,
  halves: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17" /><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" stroke="none" /></>,
  wave: <><path d="M3 10c2.5-2.5 4.5-2.5 6 0s3.5 2.5 6 0 4.5-2.5 6 0" /><path d="M3 15c2.5-2.5 4.5-2.5 6 0s3.5 2.5 6 0 4.5-2.5 6 0" /></>,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  back: <><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>,
  arrow: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
  retry: <><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4.5h4.5" /></>,
  bolt: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
  bulb: <><path d="M9 17h6" /><path d="M10 20.5h4" /><path d="M8.2 13.6A6 6 0 1 1 15.8 13.6c-.8.7-1.3 1.6-1.3 2.4H9.5c0-.8-.5-1.7-1.3-2.4z" /></>,
  steps: <><path d="M7 19.5c-1.8 0-2.6-1.5-2.4-3.4.2-1.6 1-2.6 2.4-2.6s2 1.1 2 2.6c0 2-.6 3.4-2 3.4z" /><path d="M16 12.5c-1.4 0-2-1.4-2-3.4 0-1.5.6-2.6 2-2.6s2.2 1 2.4 2.6c.2 1.9-.6 3.4-2.4 3.4z" /></>,
  close: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
};

export type IconName = keyof typeof PATHS;

export const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {PATHS[name]}
  </svg>
);

const BADGE_SIZES = {
  sm: { box: 'w-7 h-7', icon: 'w-[15px] h-[15px]' },
  md: { box: 'w-9 h-9', icon: 'w-[18px] h-[18px]' },
  lg: { box: 'w-12 h-12', icon: 'w-6 h-6' },
};

// An icon on a small clay disc.
export const IconBadge: React.FC<{ name: IconName; size?: keyof typeof BADGE_SIZES; className?: string }> = ({
  name,
  size = 'md',
  className = 'text-[#6A5283]',
}) => (
  <span
    className={`${BADGE_SIZES[size].box} shrink-0 inline-grid place-items-center rounded-full bg-gradient-to-br from-white to-[#F5F2EB] shadow-[3px_3px_7px_rgba(150,140,120,0.28),-3px_-3px_7px_#FFFFFF] ${className}`}
  >
    <Icon name={name} className={BADGE_SIZES[size].icon} />
  </span>
);
