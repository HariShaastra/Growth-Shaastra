import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* The "Growth" Core - A pulsing seed of life */}
        <motion.circle
          cx="50"
          cy="50"
          r="8"
          fill="#D97706"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* The 4 Shaastras - Petals representing the subsystems */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.path
            key={i}
            d="M50 35 C65 35 70 50 50 65 C30 50 35 35 50 35"
            stroke="#3E2723"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ originX: '50px', originY: '50px' }}
            initial={{ rotate: angle, scale: 0 }}
            animate={{ rotate: angle, scale: 1 }}
            transition={{ delay: i * 0.2, duration: 1, ease: "easeOut" }}
          />
        ))}

        {/* Orbiting particles of thought */}
        {[1, 2, 3].map((particle) => (
          <motion.circle
            key={particle}
            cx="50"
            cy="50"
            r={15 + particle * 10}
            stroke="#D97706"
            strokeWidth="0.5"
            strokeDasharray="4 8"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10 + particle * 5, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* The Impact Sparkle from Karya Shaastra */}
        <motion.path
          d="M85 15 L87 25 L97 27 L87 29 L85 39 L83 29 L73 27 L83 25 Z"
          fill="#D97706"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </svg>
    </div>
  );
};
