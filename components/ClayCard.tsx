import React from 'react';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ClayCard: React.FC<ClayCardProps> = ({ children, className = "", onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={`
        bg-gradient-to-br from-[#D8E8D4] to-[#FBF6D9]
        rounded-[2rem] md:rounded-[2.5rem]
        shadow-[12px_12px_24px_rgba(170,170,160,0.2),-12px_-12px_24px_rgba(255,255,255,1)]
        border border-white/60
        p-6 md:p-8 
        transition-all duration-300 ease-out
        relative overflow-hidden
        ${onClick ? 'cursor-pointer active:scale-[0.98] hover:shadow-[16px_16px_32px_rgba(170,170,160,0.25),-16px_-16px_32px_rgba(255,255,255,1)] outline-none focus:ring-4 focus:ring-[#8AB89F]/30' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};