
import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

interface BufferStepProps {
  onFinish: () => void;
  onSkip?: () => void;
  duration?: number;
  text: {
    inhale: string;
    exhale: string;
    connecting: string;
    slowly: string;
    skip_breathing?: string;
  };
}

export const BufferStep = ({ onFinish, onSkip, duration = 3500, text }: BufferStepProps) => {
  // Use state to track the breathing phase: 'inhale' | 'exhale'
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    const timer = setTimeout(onFinish, duration);
    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  // Define variants for the breathing animation
  // Inhale: Scale up (4s)
  // Exhale: Scale down (6s) - Longer exhale activates parasympathetic nervous system
  const breathVariants: Variants = {
    inhale: {
      scale: 1.3,
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
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
      {/* Breathing Bubble */}
      <motion.div
        animate={breathPhase}
        variants={breathVariants}
        // Toggle phase when current animation finishes
        onAnimationComplete={() => setBreathPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale')}
        className="w-40 h-40 rounded-full bg-[#88C9A1] shadow-[20px_20px_40px_#72AB88,-20px_-20px_40px_#9EE7BA] flex items-center justify-center text-white font-black text-lg relative overflow-hidden"
      >
        {/* Shine/Reflection for 3D effect */}
        <div className="absolute top-6 left-8 w-8 h-4 bg-white/40 rounded-full blur-[2px] transform -rotate-45"></div>
        
        {/* Dynamic Text based on phase */}
        <span className="relative z-10 select-none">
          {breathPhase === 'inhale' ? text.inhale : text.exhale}
        </span>
      </motion.div>
      
      <p className="mt-10 text-slate-400 font-bold text-lg animate-pulse">{text.connecting}</p>
      {duration > 5000 && <p className="mt-2 text-[#88C9A1] font-bold text-sm bg-white/50 px-3 py-1 rounded-full">{text.slowly}</p>}
      
      {/* Skip Button (Conditional) */}
      {onSkip && (
        <button 
          onClick={onSkip}
          className="mt-8 text-[#8C8C8C]/50 hover:text-[#8C8C8C] text-sm font-bold underline decoration-dashed transition-colors cursor-pointer"
        >
          {text.skip_breathing || "Skip"}
        </button>
      )}
    </div>
  );
};
