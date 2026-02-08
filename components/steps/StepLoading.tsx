
import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';

interface StepLoadingProps {
  t: any;
  isOfflineMode: boolean;
  actions: {
    skipLoading: () => void;
  };
}

export const StepLoading: React.FC<StepLoadingProps> = ({ t, isOfflineMode, actions }) => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

  // Breathing Rhythm: 4s Inhale, 6s Exhale
  const breathVariants: Variants = {
    inhale: {
      scale: 1.25,
      transition: {
        duration: 4, 
        ease: "easeInOut"
      }
    },
    exhale: {
      scale: 1,
      transition: {
        duration: 6, 
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[50vh]">
       
       {/* Breathing Bubble - Restored Clay Style */}
       <motion.div 
         animate={phase}
         variants={breathVariants}
         onAnimationComplete={() => setPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale')}
         className="w-36 h-36 rounded-full bg-[#88C9A1] shadow-[20px_20px_40px_#72AB88,-20px_-20px_40px_#9EE7BA] flex items-center justify-center text-white font-black text-xl relative overflow-hidden mb-10"
       >
          {/* Shine/Reflection for 3D effect */}
          <div className="absolute top-6 left-8 w-8 h-4 bg-white/40 rounded-full blur-[2px] transform -rotate-45"></div>
          
          {/* Text Inside Bubble */}
          <span className="relative z-10 select-none tracking-wide">
            {phase === 'inhale' ? t.buffer_inhale : t.buffer_exhale}
          </span>
       </motion.div>

       {/* Secondary Reassurance Text */}
       <p className="text-[#8C8C8C]/60 font-bold text-sm">
         {t.buffer_connecting}
       </p>
       
       {isOfflineMode ? (
         <p className="mt-8 text-xs text-[#E08D79] font-bold">Connecting to offline templates...</p>
       ) : (
         <button onClick={actions.skipLoading} className="mt-12 text-xs text-[#8C8C8C]/40 hover:text-[#8C8C8C] underline decoration-dashed transition-colors">
            {t.skip_button}
         </button>
       )}
    </div>
  );
};
