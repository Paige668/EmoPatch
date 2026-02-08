
import React from 'react';
import { ClayCard } from '../ClayCard';
import { PERSONA_LABELS } from '../../constants';
import { ReframeType, Language } from '../../types';

interface StepChoiceProps {
  t: any;
  data: any;
  language: Language;
  fallbackMessage: string | null;
  actions: {
    selectReframe: (type: string, content: string) => void;
  };
}

export const StepChoice: React.FC<StepChoiceProps> = ({ t, data, language, fallbackMessage, actions }) => {
  
  const getCardStyle = (type: ReframeType) => {
    switch (type) {
      case ReframeType.SOCIOLOGIST:
        // Yellow: Matches the "Interpretation" box from previous step
        return "!from-[#FDEEBE] !to-[#FFF9E5]";
      case ReframeType.SHIELD:
        // Purple: Matches the "Puzzle Piece" purple from Home
        // Gradient from very light purple to the base puzzle purple (#D4C4E8)
        return "!from-[#E6DDF2] !to-[#D4C4E8]"; 
      case ReframeType.CAMERA:
      default:
        // Default Green (Matches Fact box / Back button)
        return "";
    }
  };

  const getTitleColor = (type: ReframeType) => {
    switch (type) {
      case ReframeType.SOCIOLOGIST:
        return "text-[#9C7A1F]"; // Darker Ochre/Gold
      case ReframeType.SHIELD:
        return "text-[#7B6194]"; // Darker Purple
      case ReframeType.CAMERA:
      default:
        return "text-[#4A7A5E]"; // Darker Sage Green
    }
  };

  return (
    <div>
       <h2 className="text-2xl font-black text-[#4A4A4A] mb-6 text-center leading-tight">
          {t.choice_title}
       </h2>
       {data.isFallback && fallbackMessage && (
         <div className="mb-4 bg-[#FFF4E5] border border-[#FFD8A8] text-[#C05621] px-4 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
             <span>⚡</span> 
             {fallbackMessage}
         </div>
       )}
       
       <div className="grid gap-6">
          {[ReframeType.CAMERA, ReframeType.SOCIOLOGIST, ReframeType.SHIELD].map((type) => {
             const label = PERSONA_LABELS[language][type];
             // The AI returns lowercase keys, so we map enum to lowercase key (sociologist)
             const content = data.reframes ? data.reframes[type.toLowerCase() as keyof typeof data.reframes] : '';
             const bgOverride = getCardStyle(type);
             const titleColor = getTitleColor(type);

             return (
               <ClayCard 
                 key={type} 
                 onClick={() => actions.selectReframe(type, content as string)}
                 className={bgOverride}
               >
                  <div className="flex items-center gap-3 mb-3">
                     <span className="text-2xl">{label.emoji}</span>
                     <span className={`font-bold ${titleColor}`}>{label.title}</span>
                  </div>
                  <p className="text-sm text-[#5D5D5D] leading-relaxed">{content}</p>
               </ClayCard>
             );
          })}
       </div>
    </div>
  );
};
