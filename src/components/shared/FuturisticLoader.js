import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const FuturisticLoader = ({ size = 'default', text = 'Loading', className = '' }) => {
  const { isDark } = useTheme();
  
  const getSize = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${getSize()}`}>
        {/* Outer ring */}
        <div className={`absolute inset-0 rounded-full ${
          isDark ? 'border-blue-500' : 'border-blue-600'
        } border-4 opacity-20`}></div>
        
        {/* Spinning inner ring */}
        <div className={`absolute inset-0 rounded-full ${
          isDark ? 'border-blue-400' : 'border-blue-500'
        } border-4 border-t-transparent animate-spin`}></div>
        
        {/* Center dot */}
        <div className={`absolute inset-2 rounded-full ${
          isDark ? 'bg-blue-500' : 'bg-blue-600'
        } animate-pulse`}></div>
      </div>
      
      {/* Loading text with glowing effect */}
      <div className={`mt-4 text-sm font-medium ${
        isDark ? 'text-blue-400' : 'text-blue-600'
      } animate-pulse`}>
        {text}
      </div>
    </div>
  );
};

export default FuturisticLoader;
