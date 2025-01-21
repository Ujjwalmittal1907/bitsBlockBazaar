import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ModernLoader = ({ size = 'default', text = 'Loading' }) => {
  const { isDark } = useTheme();
  
  const getSize = () => {
    switch(size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${getSize()} rounded-full absolute
          border-4 border-solid ${isDark ? 'border-gray-700' : 'border-gray-200'}
          opacity-20`}>
        </div>
        
        {/* Inner spinning ring */}
        <div className={`${getSize()} rounded-full animate-spin absolute
          border-4 border-solid ${isDark ? 'border-blue-500' : 'border-blue-600'}
          border-t-transparent`}>
        </div>
        
        {/* Pulsing circle */}
        <div className={`${getSize()} rounded-full animate-pulse
          ${isDark ? 'bg-purple-500' : 'bg-purple-600'}
          opacity-20`}>
        </div>
        
        {/* Floating dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
      
      {/* Loading text with shimmer effect */}
      <div className="mt-4 relative">
        <div className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {text}
        </div>
        <div className="absolute inset-0 animate-pulse opacity-50 bg-gradient-to-r from-transparent via-white to-transparent" 
          style={{ 
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite'
          }}>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2 w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-progress"
          style={{
            width: '100%',
            animation: 'progress 2s ease-in-out infinite'
          }}>
        </div>
      </div>
    </div>
  );
};

export default ModernLoader;

// Add these keyframes to your index.css
/*
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}
*/
