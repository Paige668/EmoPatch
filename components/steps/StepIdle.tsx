import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../ui/Icon';
import type { UIText } from '../../constants';

interface StepIdleProps {
  t: UIText;
  actions: {
    startFlow: () => void;
    startDemo: () => void;
  };
}

// Custom Clay Puzzle Cluster Component
const ClayPuzzlePatch = ({ onClick, ariaLabel }: { onClick: () => void; ariaLabel: string }) => {
  return (
    <motion.div
      onClick={onClick}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      variants={{
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
        hover: { scale: 1.05, rotate: 2 },
        tap: { scale: 0.95 }
      }}
      // Increased size from w-64 to w-80 for visual impact
      className="relative w-80 h-80 cursor-pointer flex items-center justify-center z-10"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <svg
        // Adjusted viewBox to zoom in on the pieces (tightened from 0 0 220 220)
        viewBox="10 15 160 170"
        className="w-full h-full drop-shadow-2xl"
        style={{ filter: "drop-shadow(10px 10px 20px rgba(138, 184, 159, 0.3)) drop-shadow(-8px -8px 16px rgba(255, 255, 255, 0.8))" }}
      >
        <defs>
          {/* 1. Sage Green Gradient */}
          <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B5DBC3" />
            <stop offset="100%" stopColor="#8AB89F" />
          </linearGradient>

          {/* 2. Warm Yellow Gradient */}
          <linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE59E" />
            <stop offset="100%" stopColor="#F4D06F" />
          </linearGradient>

          {/* 3. Soft Purple Gradient (Base for fabric) */}
          <linearGradient id="gradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4C4E8" />
            <stop offset="100%" stopColor="#B79FD4" />
          </linearGradient>
          
          {/* Fabric Pattern for the Purple Patch */}
          <pattern id="fabricTexture" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
             <path d="M 0 6 L 6 0" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round"/>
             <path d="M 0 0 L 6 6" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round"/>
          </pattern>
          
          {/* Soft Bevel Filter for Clay Look */}
          <filter id="clayBevel">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="1" dy="2" result="offsetBlur" />
            <feSpecularLighting in="blur" surfaceScale="2" specularConstant="0.3" specularExponent="10" lightingColor="#ffffff" result="specOut">
              <fePointLight x="-5000" y="-10000" z="10000" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
          </filter>
        </defs>

        {/* Group with Clay Filter */}
        <g filter="url(#clayBevel)" strokeLinecap="round" strokeLinejoin="round">
            
            {/* Piece 1: Green (Top Left) */}
            <motion.path 
                variants={{ hover: { x: -2, y: -2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                d="M 30 30 L 90 30 L 90 55 C 80 55 80 75 90 75 L 90 100 L 65 100 C 65 90 45 90 45 100 L 30 100 L 30 30 Z"
                fill="url(#gradGreen)"
                stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5"
            />

            {/* Piece 2: Yellow (Top Right) */}
            <motion.path 
                variants={{ hover: { x: 2, y: -2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                d="M 90 30 L 150 30 L 150 100 L 125 100 C 125 110 105 110 105 100 L 90 100 L 90 75 C 80 75 80 55 90 55 L 90 30 Z"
                fill="url(#gradYellow)"
                stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5"
            />

            {/* Piece 3: Purple (Bottom) - The Fabric Patch - SCALES UP ON HOVER */}
            <motion.g
                variants={{
                    hover: { 
                        scale: 1.15,
                        y: 5,
                        transition: { type: "spring", stiffness: 400, damping: 15 }
                    }
                }}
                style={{ originX: "90px", originY: "130px" }}
            >
                {/* Base Purple Shape */}
                <path 
                    d="M 30 100 L 45 100 C 45 90 65 90 65 100 L 90 100 L 105 100 C 105 110 125 110 125 100 L 150 100 L 150 160 L 30 160 L 30 100 Z"
                    fill="url(#gradPurple)"
                />
                
                {/* Fabric Texture Overlay */}
                <path 
                    d="M 30 100 L 45 100 C 45 90 65 90 65 100 L 90 100 L 105 100 C 105 110 125 110 125 100 L 150 100 L 150 160 L 30 160 L 30 100 Z"
                    fill="url(#fabricTexture)"
                />

                {/* Stitches Border */}
                <path 
                    d="M 30 100 L 45 100 C 45 90 65 90 65 100 L 90 100 L 105 100 C 105 110 125 110 125 100 L 150 100 L 150 160 L 30 160 L 30 100 Z"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    strokeOpacity="0.9"
                />
                {/* Patchy's face: the patch in the logo is the mascot itself. */}
                <g className="patchy-blink" style={{ transformOrigin: '90px 129px' }}>
                    <ellipse cx="78" cy="129" rx="3.6" ry="4.8" fill="#4A3F55" />
                    <ellipse cx="102" cy="129" rx="3.6" ry="4.8" fill="#4A3F55" />
                    <circle cx="79.2" cy="127" r="1.2" fill="#FFFFFF" />
                    <circle cx="103.2" cy="127" r="1.2" fill="#FFFFFF" />
                </g>
                <circle cx="69" cy="139" r="4.6" fill="#F3A5A0" opacity="0.6" />
                <circle cx="111" cy="139" r="4.6" fill="#F3A5A0" opacity="0.6" />
                <motion.path
                    variants={{
                        initial: { d: 'M84 138 Q90 143 96 138' },
                        animate: { d: 'M84 138 Q90 143 96 138' },
                        hover: { d: 'M84 136 Q90 148 96 136' },
                        tap: { d: 'M84 136 Q90 148 96 136' },
                    }}
                    d="M84 138 Q90 143 96 138"
                    fill="none"
                    stroke="#4A3F55"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                />
            </motion.g>
        </g>
      </svg>
      
      {/* Subtle background texture for the container to ground it */}
      <div className="absolute inset-0 pointer-events-none opacity-10 rounded-full" 
           style={{ backgroundImage: 'radial-gradient(circle, #8AB89F 1px, transparent 1px)', backgroundSize: '15px 15px', maskImage: 'radial-gradient(circle, black 40%, transparent 70%)' }}>
      </div>
    </motion.div>
  );
};

export const StepIdle: React.FC<StepIdleProps> = ({ t, actions }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Branding Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-5xl md:text-6xl mb-1 drop-shadow-sm">
            <span className="text-[#8AB89F]">Emo</span><span className="text-[#B79FD4]">Patch</span>
        </h1>
        <p className="text-[#5D5D5D] font-bold text-sm md:text-base leading-relaxed max-w-sm mx-auto">
            {t.app_slogan}
        </p>
      </div>

      {/* Trigger Button - New Clay Puzzle Patch Cluster */}
      {/* Added z-10 relative to ensure it sits 'above' if needed, but the text will overlap from bottom */}
      <div className="z-10 pl-2 relative">
        <ClayPuzzlePatch onClick={actions.startFlow} ariaLabel={t.puzzle_aria} />
        {/* Patchy says hello from inside the logo. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 320, damping: 14 }}
          className="pointer-events-none absolute right-0 bottom-[30%] z-20 origin-bottom-left rounded-[1.1rem] bg-white px-3.5 py-2 font-display text-[15px] text-[#6A5283] shadow-[4px_4px_10px_rgba(150,140,120,0.3)]"
        >
          <span aria-hidden="true" className="absolute -left-1.5 bottom-3 h-3.5 w-3.5 rotate-45 rounded-[3px] bg-white" />
          <span className="relative">{t.home_patchy_hi}</span>
        </motion.div>
      </div>
      
      {/* Action Text - Redesigned for Warmth & Liveliness */}
      {/* Reduced negative margin from -mt-24 to -mt-6 to ensure text sits below the puzzle image */}
      <div className="flex flex-col items-center z-20 -mt-6 relative pointer-events-none">
          
          {/* Main Title: Bolder, darker grey, REMOVED rotation to keep it straight */}
          <motion.h2 
            initial={{ opacity: 0, y: 10, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-2xl md:text-3xl text-center text-[#655C70] drop-shadow-sm mb-3 bg-white/40 backdrop-blur-md px-6 py-2 rounded-3xl pointer-events-auto"
          >
            {t.home_title}
          </motion.h2>

          {/* Subtitle / Call to Action: Styled as a soft, inviting pill button */}
          <motion.button 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             transition={{ delay: 0.4 }}
             onClick={actions.startFlow}
             className="pointer-events-auto group flex items-center justify-center bg-[#FFFBF0] border border-[#EFEBE6] px-10 py-3 rounded-full shadow-[8px_8px_16px_#E6D8D1,-8px_-8px_16px_#FFFFFF] cursor-pointer mt-1"
          >
             <span className="font-display text-[#6B6B6B] text-base tracking-wide group-hover:text-[#C0654F] transition-colors">
                 {t.home_subtitle}
             </span>
          </motion.button>

          {/* Sample moment: a fully cached walkthrough of the adaptive loop */}
          <motion.button
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.55 }}
             onClick={actions.startDemo}
             className="pointer-events-auto mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#7B6194] underline decoration-dashed underline-offset-4 hover:text-[#5D4778] transition-colors"
          >
             <Icon name="puzzle" className="w-4 h-4" />{t.demo_button}
          </motion.button>

      </div>
    </div>
  );
};
