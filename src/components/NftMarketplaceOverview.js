import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FuturisticLoader, FuturisticCard } from './shared';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const NftMarketplaceOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Loading Marketplace..." />
      </div>
    );
  }

  const marketplaceFeatures = [
    {
      title: 'Trading Analytics',
      description: 'Comprehensive trading analytics and market insights',
      path: '/marketplaceanalytics',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Top Traders',
      description: 'Track and analyze top performing traders',
      path: '/marketplacetraders',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Wash Trade Detection',
      description: 'Advanced wash trading detection and analysis',
      path: '/marketplacewashtraders',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      title: 'Volume Analysis',
      description: 'Detailed volume analysis and trends',
      path: '/nftmarketplace',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Market Overview',
      description: 'High-level market overview and statistics',
      path: '/marketplaceoverview',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Holder Analytics',
      description: 'In-depth holder distribution analysis',
      path: '/marketplaceholders',
      gradient: 'from-indigo-500 to-violet-500'
    }
  ];

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className={`text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          NFT Marketplace
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {marketplaceFeatures.map((feature, index) => (
            <motion.div
              key={feature.path}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={feature.path}>
                <FuturisticCard
                  className="h-full p-6 transition-all duration-300"
                  gradient={`bg-gradient-to-br ${feature.gradient}`}
                >
                  <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </FuturisticCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NftMarketplaceOverview;
