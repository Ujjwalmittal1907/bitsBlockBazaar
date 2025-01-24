import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const LoaderCard = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
      <div className="h-48 bg-gray-300 animate-pulse"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-1/3 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-1/2 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoaderCard;
