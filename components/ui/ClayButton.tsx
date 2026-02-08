import React from 'react';

interface ClayButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}

export const ClayButton: React.FC<ClayButtonProps> = ({ onClick, children, className = '', variant = 'primary', disabled = false }) => {
  const base = "transform transition-all duration-300 active:scale-95 font-bold rounded-2xl flex items-center justify-center py-3 px-6";
  const variants = {
    primary: "bg-[#8AB89F] text-white shadow-[6px_6px_12px_#759c87,-6px_-6px_12px_#9fd4b7] active:shadow-[inset_4px_4px_8px_#6f9480,inset_-4px_-4px_8px_#a5dbc0]",
    secondary: "bg-gradient-to-br from-[#D8E8D4] to-[#FBF6D9] text-[#4A4A4A] shadow-[6px_6px_12px_#D6D1C9,-6px_-6px_12px_#FFFFFF] active:shadow-[inset_4px_4px_8px_#D6D1C9,inset_-4px_-4px_8px_#FFFFFF] border border-white",
    danger: "bg-[#E08D79] text-white shadow-[6px_6px_12px_#c47b6a,-6px_-6px_12px_#ff9f88] active:shadow-[inset_4px_4px_8px_#c47b6a,inset_-4px_-4px_8px_#ff9f88]",
    ghost: "bg-transparent text-[#8C8C8C] hover:text-[#4A4A4A] hover:bg-black/5 shadow-none"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};