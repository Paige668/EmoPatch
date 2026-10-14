
import React, { useState } from 'react';
import { ClayCard } from '../ClayCard';
import { ClayButton } from '../ui/ClayButton';
import { FallbackNotice } from '../FallbackNotice';
import { Icon } from '../ui/Icon';
import { Patchy, PatchyGuide } from '../Patchy';
import { AddContextButton } from '../LensPieces';
import type { UIText } from '../../constants';
import type { TriageData } from '../../hooks/useTriageFlow';

interface StepFinalContentProps {
  t: UIText;
  data: TriageData;
  fallbackMessage: string | null;
  onRetry?: () => void;
  canPatch: boolean;
  actions: {
    reset: () => void;
    saveCurrentSession: () => Promise<void>;
    openContextPatch: () => void;
  };
  handlePlayAudio: () => void;
  isGeneratingAudio: boolean;
  isPlayingAudio: boolean;
}

export const StepFinalContent: React.FC<StepFinalContentProps> = ({ 
  t, 
  data, 
  fallbackMessage,
  onRetry,
  canPatch,
  actions,
  handlePlayAudio, 
  isGeneratingAudio, 
  isPlayingAudio 
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);

  const handleSave = async () => {
    await actions.saveCurrentSession();
    setIsSaved(true);
  };

  const followUp = data.followUp;
  if (!followUp) return null;
  const isAction = data.followUpRequestType === 'ACTION';
  const toggleStep = (index: number) =>
    setDoneSteps(steps => steps.includes(index) ? steps.filter(i => i !== index) : [...steps, index]);
  const allDone = isAction && doneSteps.length === followUp.keyPoints.length;

  return (
    <div>
       <ClayCard className="mb-6">
          <div className="flex justify-between items-start mb-4">
             <span className="bg-[#CDE8D6] text-[#4A7A5E] text-xs font-black px-3 py-1.5 uppercase tracking-wider inline-block shadow-sm rounded-lg">
               {followUp.encouragement || t.final_title}
             </span>
             
             <button
               type="button"
               onClick={handlePlayAudio}
               disabled={isGeneratingAudio || isPlayingAudio}
               aria-label={isGeneratingAudio ? t.audio_loading : isPlayingAudio ? t.audio_playing : t.audio_play}
               title={t.audio_play}
               className="squish w-10 h-10 grid place-items-center rounded-full bg-white/70 text-[#6A5283] shadow-[3px_3px_7px_rgba(150,140,120,0.28),-3px_-3px_7px_#FFFFFF] disabled:opacity-60"
             >
                {isGeneratingAudio
                  ? <Patchy mood="thinking" className="w-8" />
                  : <Icon name={isPlayingAudio ? 'speakerOn' : 'speaker'} className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />}
             </button>
          </div>
          
          <h2 className="font-display text-[26px] text-[#655C70] mb-3 text-center text-balance">{followUp.headline}</h2>
          <p className="text-[#5D5D5D] leading-relaxed mb-6 font-medium">{followUp.mainInsight}</p>

          {isAction && (
            <p className="text-xs font-bold text-[#4A7A5E] mb-2" role="status">
              {t.steps_progress.replace('{n}', String(doneSteps.length)).replace('{total}', String(followUp.keyPoints.length))}
            </p>
          )}
          <ol className="space-y-3 mb-6">
             {followUp.keyPoints.map((point: string, i: number) => {
               const text = point.replace(/^[•-]\s*/, '');
               const done = doneSteps.includes(i);
               const badge = (
                 <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                   done ? 'bg-[#8AB89F] text-white' : 'bg-white text-[#E08D79] shadow-sm'
                 }`} aria-hidden="true">
                   {done ? <Icon name="check" className="w-3.5 h-3.5 pop" /> : i + 1}
                 </span>
               );
               return (
                 <li key={i}>
                   {isAction ? (
                     <button
                       type="button"
                       onClick={() => toggleStep(i)}
                       aria-pressed={done}
                       className="squish w-full flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 text-left hover:bg-white/80"
                     >
                       {badge}
                       <span className={`text-sm font-semibold ${done ? 'text-[#8C8C8C] line-through' : 'text-[#4A4A4A]'}`}>{text}</span>
                     </button>
                   ) : (
                     <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3">
                       {badge}
                       <span className="text-sm font-semibold text-[#4A4A4A]">{text}</span>
                     </div>
                   )}
                 </li>
               );
             })}
          </ol>
          
          <div className="bg-[#CDE8D6] p-5 rounded-2xl text-sm font-bold text-[#4A7A5E] shadow-inner leading-relaxed relative overflow-hidden">
              <div className="absolute top-[-10px] right-[-10px] text-[#4A7A5E]/10 text-6xl">”</div>
              {followUp.advice}
          </div>
       </ClayCard>
       
       {data.isFallback && (
         <FallbackNotice message={fallbackMessage} retryLabel={t.retry_button} onRetry={onRetry} />
       )}

       {allDone && <PatchyGuide mood="cheer" className="mb-5">{t.final_bubble_done}</PatchyGuide>}

       {canPatch && data.reframes && (
         <AddContextButton label={t.context_patch_button} onClick={actions.openContextPatch} className="mb-2" />
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
            <p className="text-[#757575] text-xs font-bold mt-3" role="status">
                {t.saved_hint}
            </p>
          )}
       </div>
    </div>
  );
};
