import React from 'react';

export const ClayInput = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`
      w-full bg-gradient-to-br from-[#D8E8D4] to-[#FBF6D9] text-[#4A4A4A] placeholder-[#A0A0A0]
      shadow-[inset_6px_6px_12px_#DED9D4,inset_-6px_-6px_12px_#FFFFFF] 
      rounded-2xl p-5 border-none resize-none outline-none
      focus:ring-2 focus:ring-[#8AB89F]/30 transition-all
      text-lg leading-relaxed
      ${props.className}
    `}
  />
);