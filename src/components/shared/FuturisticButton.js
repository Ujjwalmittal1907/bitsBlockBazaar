import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const FuturisticButton = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  icon = null
}) => {
  const { isDark } = useTheme();

  const getVariantClasses = () => {
    const baseClasses = 'relative overflow-hidden rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2';
    
    const variants = {
      primary: `${isDark 
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500' 
        : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400'
      } text-white shadow-lg shadow-blue-500/25`,
      
      secondary: `${isDark
        ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
      } border border-gray-700/20`,
      
      outline: `border-2 ${isDark
        ? 'border-blue-500 hover:bg-blue-500/10 text-blue-400'
        : 'border-blue-600 hover:bg-blue-600/10 text-blue-600'
      }`,
      
      ghost: `${isDark
        ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
      }`
    };

    return `${baseClasses} ${variants[variant]}`;
  };

  const getSizeClasses = () => {
    const sizes = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg'
    };
    return sizes[size];
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {/* Animated gradient background */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}

      {/* Content */}
      <div className="relative flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        {children}
      </div>

      {/* Corner accents for primary variant */}
      {variant === 'primary' && (
        <>
          <div className="absolute top-0 left-0 w-1 h-1 bg-white/40" />
          <div className="absolute top-0 right-0 w-1 h-1 bg-white/40" />
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-white/40" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/40" />
        </>
      )}
    </motion.button>
  );
};

export default FuturisticButton;
