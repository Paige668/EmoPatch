import React from 'react';
import { ClayButton } from '../ui/ClayButton';
import { Icon, IconBadge } from '../ui/Icon';
import { PERSONA_LABELS, type UIText } from '../../constants';
import { ReframeType, Language } from '../../types';
import type { TriageData } from '../../hooks/useTriageFlow';

interface StepDepthChoiceProps {
  t: UIText;
  data: TriageData;
  language: Language;
  actions: {
    fetchFollowUp: (type: 'EXPLAIN' | 'ACTION') => void;
  };
}

export const StepDepthChoice: React.FC<StepDepthChoiceProps> = ({ t, data, language, actions }) => {
  return (
    <div>
       <div className="text-center mb-10">
          <div className="inline-flex mb-4">
             <IconBadge name={PERSONA_LABELS[language][data.selectedReframeType as ReframeType]?.icon || 'compass'} size="lg" />
          </div>
          <h2 className="font-display text-[26px] text-[#4A4A4A] px-4">{t.depth_question}</h2>
       </div>
       
       <div className="space-y-4">
          <ClayButton 
            onClick={() => actions.fetchFollowUp('EXPLAIN')} 
            variant="secondary" 
            className="w-full !py-6 !text-lg !justify-start px-8 gap-3"
          >
             <IconBadge name="bulb" className="text-[#85651A]" />{t.explain_button}
          </ClayButton>
          <ClayButton 
            onClick={() => actions.fetchFollowUp('ACTION')} 
            variant="secondary" 
            className="w-full !py-6 !text-lg !justify-start px-8 gap-3"
          >
             <IconBadge name="steps" className="text-[#3F6B52]" />{t.action_button}
          </ClayButton>
       </div>
    </div>
  );
};