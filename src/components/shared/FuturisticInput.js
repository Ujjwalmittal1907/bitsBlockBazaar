import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const FuturisticInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  label,
  error,
  icon,
  className = '',
  disabled = false
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`relative ${className}`}>
      {/* Label with animated underline */}
      {label && (
        <label className="block mb-2 text-sm font-medium">
          {label}
          <motion.div
            className={`h-0.5 ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.3 }}
          />
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Background gradient */}
        <div className={`
          absolute inset-0 rounded-lg
          ${isDark 
            ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800' 
            : 'bg-gradient-to-r from-gray-100 via-white to-gray-100'}
        `} />

        {/* Icon */}
        {icon && (
          <div className={`
            absolute left-3 top-1/2 -translate-y-1/2
            ${isDark ? 'text-gray-400' : 'text-gray-500'}
          `}>
            {icon}
          </div>
        )}

        {/* Input field */}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            relative w-full px-4 py-2.5 
            ${icon ? 'pl-10' : 'pl-4'}
            rounded-lg border-2 
            bg-transparent
            transition-all duration-200
            ${isDark
              ? 'text-gray-100 border-gray-700 focus:border-blue-500'
              : 'text-gray-900 border-gray-200 focus:border-blue-600'
            }
            ${disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'focus:outline-none focus:ring-2 focus:ring-blue-500/20'
            }
            ${error ? 'border-red-500' : ''}
          `}
        />

        {/* Animated corner accents */}
        <motion.div
          className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 rounded-tl-lg
            ${isDark ? 'border-blue-500' : 'border-blue-600'}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.div
          className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 rounded-tr-lg
            ${isDark ? 'border-blue-500' : 'border-blue-600'}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        />
        <motion.div
          className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 rounded-bl-lg
            ${isDark ? 'border-blue-500' : 'border-blue-600'}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        />
        <motion.div
          className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 rounded-br-lg
            ${isDark ? 'border-blue-500' : 'border-blue-600'}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, delay: 0.3 }}
        />
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          className="mt-1 text-sm text-red-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default FuturisticInput;
