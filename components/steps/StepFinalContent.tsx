
import React, { useState } from 'react';
import { ClayCard } from '../ClayCard';
import { ClayButton } from '../ui/ClayButton';

interface StepFinalContentProps {
  t: any;
  data: any;
  fallbackMessage: string | null;
  actions: {
    reset: () => void;
    saveCurrentSession: () => Promise<void>;
  };
  handlePlayAudio: () => void;
  isGeneratingAudio: boolean;
  isPlayingAudio: boolean;
}

export const StepFinalContent: React.FC<StepFinalContentProps> = ({ 
  t, 
  data, 
  fallbackMessage, 
  actions, 
  handlePlayAudio, 
  isGeneratingAudio, 
  isPlayingAudio 
}) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await actions.saveCurrentSession();
    setIsSaved(true);
  };

  return (
    <div>
       <ClayCard className="mb-6">
          <div className="flex justify-between items-start mb-4">
             <span className="bg-[#CDE8D6] text-[#4A7A5E] text-xs font-black px-3 py-1.5 uppercase tracking-wider inline-block shadow-sm rounded-lg">
               {data.followUp.encouragement || t.final_title}
             </span>
             
             <button onClick={handlePlayAudio} disabled={isGeneratingAudio || isPlayingAudio} className="text-2xl opacity-70 hover:opacity-100 transition-opacity">
                {isGeneratingAudio ? '⏳' : isPlayingAudio ? '🔊' : '🔈'}
             </button>
          </div>
          
          <h2 className="text-2xl font-black text-[#655C70] mb-4 text-center">{data.followUp.headline}</h2>
          <p className="text-[#5D5D5D] leading-relaxed mb-6 font-medium text-justify">{data.followUp.mainInsight}</p>
          
          <div className="space-y-3 mb-6">
             {data.followUp.keyPoints.map((point: string, i: number) => (
               <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E08D79] mt-2 shrink-0"></div>
                  <p className="text-sm text-[#5D5D5D]">{point.replace(/^[•-]\s*/, '')}</p>
               </div>
             ))}
          </div>
          
          <div className="bg-[#CDE8D6] p-5 rounded-2xl text-sm font-bold text-[#4A7A5E] shadow-inner leading-relaxed relative overflow-hidden">
              <div className="absolute top-[-10px] right-[-10px] text-[#4A7A5E]/10 text-6xl">”</div>
              {data.followUp.advice}
          </div>
       </ClayCard>
       
       {data.isFallback && fallbackMessage && (
         <p className="text-xs text-center text-[#E08D79] font-bold mb-4">
             {fallbackMessage}
         </p>
       )}

       {/* Manual Save & Home Actions */}
       <div className="flex flex-col items-center mt-8">
          <div className="flex items-center justify-center gap-4">
            <ClayButton 
              onClick={handleSave} 
              disabled={isSaved}
              className={`!w-auto !px-6 !py-2.5 !rounded-xl !text-sm font-bold transition-all ${
                  isSaved 
                  ? '!bg-transparent !text-[#8AB89F] !shadow-none cursor-default' 
                  : '!bg-[#E8E8E8] !text-[#666666] !shadow-[4px_4px_8px_#C4C4C4,-4px_-4px_8px_#FFFFFF] active:!shadow-inner hover:!bg-[#E0E0E0]'
              }`}
            >
               {isSaved ? t.saved_button : t.save_button}
            </ClayButton>
            
            <ClayButton 
              onClick={actions.reset} 
              variant="primary" 
              className="!w-auto !px-6 !py-2.5 !rounded-xl !text-sm"
            >
               {t.home_button}
            </ClayButton>
          </div>
          
          {/* Saved Hint Text */}
          {isSaved && (
            <p className="text-[#8C8C8C] text-xs font-bold mt-3 animate-pulse">
                {t.saved_hint}
            </p>
          )}
       </div>
    </div>
  );
};
