import React from 'react';
import { motion } from 'framer-motion'; // Using framer-motion for easier animation control

const AnimatedLogo = () => {
  return (
    // Container for centering and potential particle background later
    <div className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64">
       {/* Glowing effect background - uses blur and opacity animation */}
      <motion.div
        className="absolute inset-0 bg-indigo-500 rounded-full blur-xl"
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse', // Loop smoothly back and forth
          ease: 'easeInOut',
        }}
      />

       {/* Main Logo shape */}
      <motion.div
        className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-600 to-blue-500 rounded-full shadow-2xl overflow-hidden"
        // Subtle rotation or pulse animation on the main logo
        animate={{
          rotate: [0, 5, -5, 0], // Slight wobble effect
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'mirror',
           ease: 'easeInOut',
        }}
      >
        {/* Placeholder for floating particles (complex - omitted for simplicity) */}
        {/* Could add absolutely positioned small elements with random animations here */}

        {/* Logo Text */}
        <span className="text-6xl md:text-7xl font-bold text-white drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          M+
        </span>
      </motion.div>
    </div>
  );
};

export default AnimatedLogo;