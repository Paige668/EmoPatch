import React from 'react';
import { motion } from 'framer-motion';

interface StepIdleProps {
  t: any;
  actions: {
    startFlow: () => void;
  };
}

// Custom Clay Puzzle Cluster Component
const ClayPuzzlePatch = ({ onClick }: { onClick: () => void }) => {
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
      aria-label="Start Emotional Patch"
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
        <h1 className="text-4xl md:text-5xl font-black mb-1 tracking-tight drop-shadow-sm">
            <span className="text-[#8AB89F]">Emo</span><span className="text-[#B79FD4]">Patch</span>
        </h1>
        <p className="text-[#8C8C8C] font-bold text-sm md:text-base tracking-wide uppercase opacity-70">
            {t.app_slogan}
        </p>
      </div>

      {/* Trigger Button - New Clay Puzzle Patch Cluster */}
      {/* Added z-10 relative to ensure it sits 'above' if needed, but the text will overlap from bottom */}
      <div className="z-10 pl-2">
        <ClayPuzzlePatch onClick={actions.startFlow} />
      </div>
      
      {/* Action Text - Redesigned for Warmth & Liveliness */}
      {/* Reduced negative margin from -mt-24 to -mt-6 to ensure text sits below the puzzle image */}
      <div className="flex flex-col items-center z-20 -mt-6 relative pointer-events-none">
          
          {/* Main Title: Bolder, darker grey, REMOVED rotation to keep it straight */}
          <motion.h2 
            initial={{ opacity: 0, y: 10, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-extrabold text-[#655C70] tracking-tight drop-shadow-sm mb-3 bg-white/40 backdrop-blur-md px-6 py-2 rounded-3xl pointer-events-auto"
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
             <span className="text-[#8C8C8C] font-bold text-sm tracking-wide uppercase group-hover:text-[#E08D79] transition-colors">
                 {t.home_subtitle}
             </span>
          </motion.button>

      </div>
    </div>
  );
};
