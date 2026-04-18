import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MascotProps {
  className?: string;
  message?: string;
  mood?: 'happy' | 'thinking' | 'excited' | 'peaceful' | 'celebrating';
}

export const Mascot: React.FC<MascotProps> = ({ className, message, mood = 'happy' }) => {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.div
        animate={mood === 'celebrating' ? {
          y: [0, -30, 0, -30, 0],
          rotate: [0, -10, 10, -10, 10, 0],
          scale: [1, 1.1, 1, 1.1, 1]
        } : {
          y: [0, -10, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: mood === 'excited' || mood === 'celebrating' ? 1.2 : 3.5,
          ease: "easeInOut"
        }}
        className="relative w-32 h-32"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_20px_40px_rgba(217,119,6,0.3)]">
          {/* Main Body - Jelly-like movement */}
          <motion.path 
            d="M50 25C30 25 20 45 20 65C20 85 35 95 50 95C65 95 80 85 80 65C80 45 70 25 50 25Z" 
            fill="#F59E0B" 
            animate={{
              d: mood === 'excited' 
                ? [
                    "M50 20C30 20 15 45 15 65C15 85 35 100 50 100C65 100 85 85 85 65C85 45 70 20 50 20Z",
                    "M50 30C35 30 25 45 25 65C25 80 35 90 50 90C65 90 75 80 75 65C75 45 65 30 50 30Z",
                    "M50 20C30 20 15 45 15 65C15 85 35 100 50 100C65 100 85 85 85 65C85 45 70 20 50 20Z"
                  ]
                : [
                    "M50 25C30 25 20 45 20 65C20 85 35 95 50 95C65 95 80 85 80 65C80 45 70 25 50 25Z",
                    "M50 27C30 27 22 47 22 67C22 84 37 93 50 93C63 93 78 84 78 67C78 47 70 27 50 27Z",
                    "M50 25C30 25 20 45 20 65C20 85 35 95 50 95C65 95 80 85 80 65C80 45 70 25 50 25Z"
                  ]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />

          {/* Top Flame/Feather */}
          <motion.path 
            d="M50 30C50 30 40 15 50 0C60 15 50 30 50 30Z" 
            fill="#D97706"
            animate={{ 
              rotate: mood === 'excited' ? [-20, 20, -20] : [-5, 5, -5],
              scaleY: mood === 'excited' ? [1, 1.4, 1] : [1, 1.1, 1],
              x: mood === 'thinking' ? [0, 2, 0] : 0
            }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />

          {/* Eyes - Blink & Expressive */}
          <g transform="translate(0, 5)">
            <motion.g animate={{ scaleY: [1, 1, 0.1, 1, 1] }} transition={{ repeat: Infinity, duration: 5, times: [0, 0.9, 0.92, 0.94, 1] }}>
              {mood === 'peaceful' ? (
                <>
                  <path d="M35 52C35 52 40 48 45 52" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                  <path d="M55 52C55 52 60 48 65 52" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : mood === 'thinking' ? (
                <>
                  <circle cx="40" cy="52" r="5" fill="#451A03" />
                  <circle cx="63" cy="52" r="5" fill="#451A03" />
                  <motion.path 
                    d="M35 44L45 46" 
                    stroke="#451A03" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  <motion.path 
                    d="M58 46L68 44" 
                    stroke="#451A03" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    animate={{ rotate: [5, -5, 5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </>
              ) : mood === 'excited' ? (
                <>
                  <path d="M32 52L45 48L32 44" stroke="#451A03" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(-10 40 48)"/>
                  <path d="M68 52L55 48L68 44" stroke="#451A03" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="rotate(10 60 48)"/>
                </>
              ) : (
                <>
                  <circle cx="40" cy="52" r="6" fill="#451A03" />
                  <circle cx="60" cy="52" r="6" fill="#451A03" />
                </>
              )}
            </motion.g>
          </g>

          {/* Mouth - Dynamic movement */}
          <motion.path 
            d={mood === 'peaceful' ? "M45 75C45 75 50 78 55 75" : mood === 'thinking' ? "M45 77H55" : (mood === 'excited' || mood === 'celebrating') ? "M40 78C40 78 50 85 60 78" : "M42 75C42 75 50 80 58 75"} 
            fill="none"
            stroke="#451A03" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            animate={(mood === 'excited' || mood === 'celebrating') ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />

          {/* Blush */}
          <motion.circle 
            cx="28" cy="68" r="6" fill="#EF4444" 
            animate={{ opacity: (mood === 'celebrating' ? [0.2, 0.6, 0.2] : [0.1, 0.3, 0.1]) }} 
            transition={{ repeat: Infinity, duration: 2 }} 
          />
          <motion.circle 
            cx="72" cy="68" r="6" fill="#EF4444" 
            animate={{ opacity: [0.1, 0.3, 0.1] }} 
            transition={{ repeat: Infinity, duration: 2 }} 
          />
        </svg>

        {/* Sparkles */}
        {(mood === 'excited' || mood === 'celebrating') && (
          <motion.div className="absolute inset-0">
            {[...Array(mood === 'celebrating' ? 12 : 6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${i % 2 === 0 ? 'bg-amber-400' : 'bg-emerald-400'} rounded-full`}
                animate={{
                  y: [-20, -100],
                  x: [0, (i % 2 === 0 ? (30 + Math.random() * 40) : (-30 - Math.random() * 40))],
                  opacity: [1, 0],
                  scale: [1, 0],
                  rotate: [0, 360]
                }}
                transition={{ repeat: Infinity, duration: 1 + Math.random(), delay: i * 0.1 }}
                style={{ left: `${15 + (i % 6) * 15}%`, top: '40%' }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="bg-stone-900/90 text-stone-100 px-6 py-4 rounded-[2rem] border border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative max-w-[260px] backdrop-blur-md"
          >
            <p className="text-sm font-serif italic leading-relaxed text-center tracking-wide">{message}</p>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-900 border-l border-t border-stone-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
