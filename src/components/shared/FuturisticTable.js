import React from 'react';
import { motion } from 'framer-motion';

const FuturisticTable = ({ headers, data, isLoading, onRowClick }) => {
  const tableAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const rowAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative overflow-x-auto shadow-md rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
      
      <table className="w-full text-sm">
        <thead className="text-xs uppercase bg-gray-700/30 text-gray-300">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left">
                <div className="flex items-center space-x-1">
                  <span>{header}</span>
                  <motion.div
                    className="w-1 h-4 bg-indigo-500/30"
                    animate={{
                      height: [4, 12, 4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <motion.tbody
          variants={tableAnimation}
          initial="hidden"
          animate="show"
          className="divide-y divide-gray-700/30"
        >
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <motion.div
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: 0
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: 0.2
                    }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-pink-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: 0.4
                    }}
                  />
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <motion.tr
                key={index}
                variants={rowAnimation}
                className="bg-white/5 hover:bg-gray-700/20 cursor-pointer transition-colors"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {Object.values(row).map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </motion.tbody>
      </table>
    </div>
  );
};

export default FuturisticTable;
