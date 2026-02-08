
import React from 'react';
import { motion } from 'framer-motion';
import { ClayCard } from '../ClayCard';
import { ClayButton } from '../ui/ClayButton';

interface StepExtremeAlertProps {
  t: any;
  alertContent: { title: string; body: string };
  actions: {
    handleExtremeChoice: (choice: 'STABILIZE' | 'CONTINUE') => void;
  };
}

export const StepExtremeAlert: React.FC<StepExtremeAlertProps> = ({ t, alertContent, actions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <ClayCard className="bg-gradient-to-br from-[#FFEFEC] to-[#FFF5F2] border-2 !border-[#E08D79] shadow-[0_0_30px_rgba(224,141,121,0.25)] relative overflow-hidden">
         {/* Background Pulse Animation */}
         <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-[#E08D79] rounded-full blur-[80px] pointer-events-none"
         />

         <div className="flex flex-col items-center text-center relative z-10">
            <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4 bg-white w-24 h-24 flex items-center justify-center rounded-full shadow-[inset_4px_4px_8px_#c47b6a,inset_-4px_-4px_8px_#ffffff]"
            >
                🐡
            </motion.div>
            
            {/* Cognitive Pattern Badge */}
            <div className="mb-3">
                <motion.span 
                  animate={{ opacity: [0.7, 1, 0.7], scale: [0.98, 1.02, 0.98] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block text-[10px] font-black text-[#E08D79] bg-[#E08D79]/10 px-3 py-1 rounded-full border border-[#E08D79]/20 uppercase tracking-widest"
                >
                    Cognitive Pattern Detected
                </motion.span>
            </div>

            <h3 className="text-2xl font-black text-[#E08D79] mb-3 tracking-tight">{alertContent.title}</h3>
            <p className="text-[#8C5E53] leading-relaxed font-medium mb-8 px-2">{alertContent.body}</p>

            <div className="w-full flex flex-col gap-4">
                <ClayButton 
                    onClick={() => actions.handleExtremeChoice('STABILIZE')} 
                    className="!bg-[#E08D79] !shadow-[6px_6px_12px_#c47b6a,-6px_-6px_12px_#ff9f88] active:!shadow-inner w-full !py-4 !text-lg !rounded-2xl"
                >
                   <span className="mr-2">🌬️</span> {t.alert_stabilize}
                </ClayButton>
                
                <button 
                    onClick={() => actions.handleExtremeChoice('CONTINUE')} 
                    className="text-xs font-bold text-[#E08D79]/60 hover:text-[#E08D79] hover:underline transition-colors py-2"
                >
                    {t.alert_continue}
                </button>
            </div>
         </div>
      </ClayCard>
    </motion.div>
  );
};
