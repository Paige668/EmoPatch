
import React, { useState } from 'react';
import { ClayCard } from '../ClayCard';
import { ClayButton } from '../ui/ClayButton';
import { ClayInput } from '../ui/ClayInput';

interface StepUserSplitProps {
  t: any;
  rawText: string;
  actions: {
    submitUserSplit: (text: string) => void;
    skipUserSplit: () => void;
  };
}

export const StepUserSplit: React.FC<StepUserSplitProps> = ({ t, rawText, actions }) => {
  const [userFact, setUserFact] = useState('');

  return (
    <div className="w-full relative">
       <h2 className="text-2xl font-black text-[#4A4A4A] mb-2 text-center">{t.user_split_title}</h2>
       <p className="text-center text-[#8C8C8C] font-bold text-sm mb-6 px-4">{t.user_split_hint}</p>

       {/* Original Text Reference */}
       <div className="bg-white/60 p-4 rounded-2xl mb-6 border border-white shadow-sm">
           <div className="text-xs font-black text-[#8C8C8C] uppercase mb-1">Your Story</div>
           <p className="text-[#4A4A4A] italic text-sm line-clamp-4">{rawText}</p>
       </div>

       <ClayCard className="mb-6">
          <ClayInput 
            placeholder={t.user_split_placeholder} 
            value={userFact}
            onChange={(e) => setUserFact(e.target.value)}
            className="min-h-[120px]"
            autoFocus
          />
       </ClayCard>

       <div className="flex flex-col gap-3">
          <ClayButton onClick={() => actions.submitUserSplit(userFact)} disabled={!userFact.trim()}>
            {t.user_split_next}
          </ClayButton>
          <ClayButton onClick={actions.skipUserSplit} variant="ghost" className="!text-xs">
            {t.user_split_skip}
          </ClayButton>
       </div>
    </div>
  );
};
