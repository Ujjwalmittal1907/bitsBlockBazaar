import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const BackButton = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <button
      onClick={() => navigate('/')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-4 transition-all duration-300 ${
        isDark
          ? 'bg-gray-800 hover:bg-gray-700 text-white'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
      }`}
    >
      <FaArrowLeft className="w-4 h-4" />
      <span>Back to Home</span>
    </button>
  );
};

export default BackButton;
