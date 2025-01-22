import React from 'react';
import { motion } from 'framer-motion';

const FuturisticCard = ({ children, className = '', gradient = '', hoverable = true }) => {
  const baseClasses = `
    relative overflow-hidden rounded-xl backdrop-blur-sm
    bg-white/10 dark:bg-gray-800/50
    border border-gray-200/20 dark:border-gray-700/30
    shadow-xl shadow-black/5
  `;

  const gradientClasses = gradient || 'bg-gradient-to-br from-indigo-500/5 to-purple-500/5';
  
  return (
    <motion.div
      className={`${baseClasses} ${gradientClasses} ${className}`}
      initial={hoverable ? { y: 0 } : false}
      whileHover={hoverable ? { y: -5, transition: { duration: 0.2 } } : false}
    >
      {/* Futuristic Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-indigo-500/30" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-purple-500/30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-purple-500/30" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-indigo-500/30" />
    </motion.div>
  );
};

export default FuturisticCard;
