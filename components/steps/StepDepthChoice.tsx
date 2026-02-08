import React from 'react';
import { ClayButton } from '../ui/ClayButton';
import { PERSONA_LABELS } from '../../constants';
import { ReframeType, Language } from '../../types';

interface StepDepthChoiceProps {
  t: any;
  data: any;
  language: Language;
  actions: {
    fetchFollowUp: (type: 'EXPLAIN' | 'ACTION') => void;
  };
}

export const StepDepthChoice: React.FC<StepDepthChoiceProps> = ({ t, data, language, actions }) => {
  return (
    <div>
       <div className="text-center mb-10">
          <div className="inline-block p-4 bg-white rounded-full shadow-[6px_6px_12px_#D6D1C9,-6px_-6px_12px_#FFFFFF] text-4xl mb-4">
             {PERSONA_LABELS[language][data.selectedReframeType as ReframeType]?.emoji}
          </div>
          <h2 className="text-2xl font-black text-[#4A4A4A] px-4">{t.depth_question}</h2>
       </div>
       
       <div className="space-y-4">
          <ClayButton 
            onClick={() => actions.fetchFollowUp('EXPLAIN')} 
            variant="secondary" 
            className="w-full !py-6 !text-lg !justify-start px-8"
          >
             {t.explain_button}
          </ClayButton>
          <ClayButton 
            onClick={() => actions.fetchFollowUp('ACTION')} 
            variant="secondary" 
            className="w-full !py-6 !text-lg !justify-start px-8"
          >
             {t.action_button}
          </ClayButton>
       </div>
    </div>
  );
};