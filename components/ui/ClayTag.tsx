import React from 'react';

interface ClayTagProps { 
  label: string; 
  isSelected: boolean; 
  onClick: () => void;
}

export const ClayTag: React.FC<ClayTagProps> = ({ label, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isSelected}
    className={`
      px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap outline-none focus:ring-2 focus:ring-[#8AB89F]/50
      ${isSelected 
        ? 'bg-[#8AB89F] text-white shadow-[inset_3px_3px_6px_#6f9480,inset_-3px_-3px_6px_#a5dbc0]' 
        : 'bg-[#FFFCF5] text-[#8C8C8C] shadow-[4px_4px_8px_#D6D1C9,-4px_-4px_8px_#FFFFFF] hover:text-[#4A4A4A] active:scale-95'}
    `}
  >
    {label}
  </button>
);