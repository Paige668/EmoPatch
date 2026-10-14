
import React, { useEffect, useState } from 'react';
import { motion, Variants, useReducedMotion } from 'framer-motion';
import { Patchy } from './Patchy';

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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onFinish, duration);
    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  // Define variants for the breathing animation
  // Inhale: Scale up (4s)
  // Exhale: Scale down (6s) for a slower visual rhythm.
  const breathVariants: Variants = {
    inhale: {
      scale: 1.2,
      transition: {
        duration: 4, 
        ease: "easeInOut"
      }
    },
    exhale: {
      scale: 0.9,
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
        animate={reduceMotion ? { scale: 1 } : breathPhase}
        variants={breathVariants}
        // Toggle phase when current animation finishes
        onAnimationComplete={reduceMotion ? undefined : () => setBreathPhase(prev => prev === 'inhale' ? 'exhale' : 'inhale')}
        className="w-48"
      >
        {/* Patchy swells on the in-breath and settles on the out-breath. */}
        <Patchy mood="breathe" className="w-48" />
      </motion.div>

      <p className="mt-8 font-display text-3xl text-[#6A5283] select-none" aria-live="polite">
        {breathPhase === 'inhale' ? text.inhale : text.exhale}
      </p>
      <p className="mt-3 text-[#757575] font-bold">{text.connecting}</p>
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
