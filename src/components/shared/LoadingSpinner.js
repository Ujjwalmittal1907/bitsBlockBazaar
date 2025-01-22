import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-indigo-500',
    secondary: 'border-purple-500',
    success: 'border-emerald-500',
    warning: 'border-amber-500'
  };

  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1
  };

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-t-transparent rounded-full ${colorClasses[color]}`}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
      <motion.div
        className={`absolute ${sizeClasses[size]} border-2 border-transparent rounded-full ${colorClasses[color]} opacity-20`}
        style={{ borderRightColor: 'currentColor' }}
        animate={{ rotate: -360 }}
        transition={spinTransition}
      />
    </div>
  );
};

export default LoadingSpinner;
