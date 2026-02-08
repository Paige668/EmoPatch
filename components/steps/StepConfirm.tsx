
import React, { useState } from 'react';
import { ClayButton } from '../ui/ClayButton';
import { ClayTag } from '../ui/ClayTag';
import { EMOTIONAL_NEEDS } from '../../constants';
import { Language } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface StepConfirmProps {
  t: any;
  data: any;
  language: Language;
  fallbackMessage: string | null;
  
  // Custom Needs State
  customNeedInput: string;
  setCustomNeedInput: (val: string) => void;
  isAddingNeed: boolean;
  setIsAddingNeed: (val: boolean) => void;
  handleAddCustomNeed: () => void;

  actions: {
    updateSplit: (updates: { fact?: string; interpretation?: string }) => void;
    toggleNeed: (need: string) => void;
    confirmSplit: () => void;
  };
}

// Simple Rounded Input Area
const SimpleClayArea = ({ label, value, onChange, placeholder, variant }: any) => {
  // Variant Styles
  const styles = variant === 'green' 
    ? {
        // Green: Fact
        bg: "bg-gradient-to-br from-[#D8E8D4] to-[#FBF6D9]",
        textLabel: "text-[#4A7A5E]",
        shadow: "shadow-[8px_8px_16px_rgba(138,184,159,0.2),-8px_-8px_16px_#FFFFFF]",
        placeholder: "placeholder-[#8AB89F]/60"
      }
    : {
        // Yellow: Interpretation
        bg: "bg-gradient-to-br from-[#FDEEBE] to-[#FFF9E5]",
        textLabel: "text-[#9C7A1F]",
        shadow: "shadow-[8px_8px_16px_rgba(210,190,140,0.15),-8px_-8px_16px_#FFFFFF]",
        placeholder: "placeholder-[#C4A050]/40"
      };

  return (
    <div className={`w-full mb-4 rounded-[2rem] p-6 md:p-8 border border-white/60 transition-all duration-300 ${styles.bg} ${styles.shadow}`}>
       <label className={`block text-xs font-black uppercase tracking-wider mb-3 ${styles.textLabel}`}>{label}</label>
       <textarea 
         className={`w-full bg-transparent border-none p-0 text-[#4A4A4A] font-medium text-lg leading-relaxed focus:ring-0 resize-none ${styles.placeholder}`}
         rows={3}
         value={value}
         onChange={onChange}
         placeholder={placeholder}
       />
    </div>
  );
};

// Needs Selection Container (The 3rd Pillar)
const NeedsClayContainer: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
    // Orange/Peach style for Needs
    const styles = {
        bg: "bg-gradient-to-br from-[#FFE4D6] to-[#FFF0E6]", 
        textLabel: "text-[#C05621]", 
        shadow: "shadow-[8px_8px_16px_rgba(224,141,121,0.15),-8px_-8px_16px_#FFFFFF]",
    };

    return (
        <div className={`w-full mb-6 rounded-[2rem] p-6 md:p-8 border border-white/60 transition-all duration-300 ${styles.bg} ${styles.shadow}`}>
            <label className={`block text-xs font-black uppercase tracking-wider mb-4 ${styles.textLabel}`}>{label}</label>
            {children}
        </div>
    );
};

export const StepConfirm: React.FC<StepConfirmProps> = ({ 
  t, 
  data, 
  language, 
  fallbackMessage,
  customNeedInput,
  setCustomNeedInput,
  isAddingNeed,
  setIsAddingNeed,
  handleAddCustomNeed,
  actions 
}) => {
  const [showComparison, setShowComparison] = useState(true);

  return (
    <div>
      <h2 className="text-2xl font-black text-[#4A4A4A] mb-6 text-center">{t.step_confirm_title}</h2>
      
      {data.isFallback && fallbackMessage && (
        <div className="mb-4 bg-[#FFF4E5] border border-[#FFD8A8] text-[#C05621] px-4 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
            <span>⚡</span> 
            {fallbackMessage}
        </div>
      )}

      {/* TRAINING COMPARISON: Only show if user attempted it */}
      {data.userFactAttempt && (
         <div className="mb-8">
            <button 
                onClick={() => setShowComparison(!showComparison)}
                className="w-full flex items-center justify-between text-xs font-black text-[#8AB89F] uppercase tracking-wider mb-2 px-1"
            >
                <span>{t.training_check_title}</span>
                <span>{showComparison ? '▼' : '▶'}</span>
            </button>
            <AnimatePresence>
                {showComparison && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white rounded-2xl p-4 shadow-[inset_2px_2px_6px_#E6D8D1] border border-[#F0F0F0] overflow-hidden"
                    >
                        <div className="mb-4">
                            <span className="text-[10px] bg-[#EFEBE6] text-[#8C8C8C] px-2 py-0.5 rounded-full font-bold">{t.training_check_user}</span>
                            <p className="text-sm text-[#4A4A4A] mt-1 pl-1 border-l-2 border-[#D6D1C9]">{data.userFactAttempt}</p>
                        </div>
                        <div>
                            <span className="text-[10px] bg-[#D8E8D4] text-[#4A7A5E] px-2 py-0.5 rounded-full font-bold">{t.training_check_ai}</span>
                            <p className="text-sm text-[#4A4A4A] mt-1 pl-1 border-l-2 border-[#8AB89F]">{data.fact}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      )}
      
      <div className="space-y-4 px-1">
        {/* 1. FACT INPUT (Green) */}
        <SimpleClayArea 
           label={t.fact_label}
           value={data.fact}
           onChange={(e: any) => actions.updateSplit({ fact: e.target.value })}
           placeholder={t.fact_placeholder}
           variant="green"
        />

        {/* 2. INTERPRETATION INPUT (Yellow) */}
        <SimpleClayArea
           label={t.interpretation_label}
           value={data.interpretation}
           onChange={(e: any) => actions.updateSplit({ interpretation: e.target.value })}
           placeholder={t.interpretation_placeholder}
           variant="yellow"
        />

        {/* 3. NEEDS SELECTION (Orange - The 3rd Pillar) */}
        <NeedsClayContainer label={t.needs_label}>
           <div className="flex flex-wrap gap-2 items-center">
              {/* Predefined Needs */}
              {EMOTIONAL_NEEDS[language].map(need => (
                <ClayTag 
                  key={need} 
                  label={need} 
                  isSelected={data.selectedNeeds.includes(need)} 
                  onClick={() => actions.toggleNeed(need)} 
                />
              ))}
              
              {/* User Custom Needs (Rendered as tags) */}
              {data.selectedNeeds
                .filter((n: string) => !EMOTIONAL_NEEDS[language].includes(n))
                .map((need: string) => (
                   <ClayTag 
                     key={need} 
                     label={need} 
                     isSelected={true} 
                     onClick={() => actions.toggleNeed(need)} 
                   />
                ))
              }

              {/* Add Custom Button/Input */}
              {isAddingNeed ? (
                  <div className="flex items-center bg-white/50 rounded-xl shadow-inner px-3 py-1 border border-[#E08D79]">
                    <input
                        autoFocus
                        className="bg-transparent border-none outline-none text-sm text-[#C05621] w-24 font-bold placeholder-[#E08D79]/50"
                        value={customNeedInput}
                        onChange={e => setCustomNeedInput(e.target.value)}
                        placeholder={t.add_need_placeholder}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleAddCustomNeed();
                            if (e.key === 'Escape') setIsAddingNeed(false);
                        }}
                        onBlur={handleAddCustomNeed}
                    />
                  </div>
              ) : (
                  <button 
                    onClick={() => setIsAddingNeed(true)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#FFF5F2] text-[#E08D79] border-2 border-dashed border-[#E08D79]/40 hover:border-[#E08D79] hover:bg-[#E08D79] hover:text-white transition-all"
                  >
                    +
                  </button>
              )}
           </div>
        </NeedsClayContainer>

        <div className="flex justify-end pt-4 pb-4">
          <ClayButton onClick={actions.confirmSplit}>{t.confirm_button}</ClayButton>
        </div>
      </div>
    </div>
  );
};
