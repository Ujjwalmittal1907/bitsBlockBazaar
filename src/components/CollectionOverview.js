import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  FuturisticLoader, 
  FuturisticCard, 
  FuturisticButton 
} from './shared';

const CollectionOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const collectionFeatures = [
    {
      title: 'Analytics',
      description: 'Deep dive into collection performance metrics',
      path: '/collectionanalytics',
      gradient: 'from-blue-500 to-indigo-500',
      icon: '📊'
    },
    {
      title: 'Categories',
      description: 'Browse collections by categories',
      path: '/collectioncategories',
      gradient: 'from-purple-500 to-pink-500',
      icon: '🏷️'
    },
    {
      title: 'Metadata',
      description: 'Explore detailed collection metadata',
      path: '/collectionmetadata',
      gradient: 'from-green-500 to-teal-500',
      icon: '📝'
    },
    {
      title: 'Scores',
      description: 'View collection rating scores',
      path: '/collectionscores',
      gradient: 'from-orange-500 to-red-500',
      icon: '⭐'
    },
    {
      title: 'Wash Trade',
      description: 'Detect wash trading activities',
      path: '/collectionwashtrade',
      gradient: 'from-pink-500 to-rose-500',
      icon: '🔍'
    },
    {
      title: 'Top Traders',
      description: 'Analyze top collection traders',
      path: '/collectiontraders',
      gradient: 'from-indigo-500 to-violet-500',
      icon: '👥'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Loading Collections..." />
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r 
            ${isDark ? 'from-indigo-400 to-pink-600' : 'from-indigo-600 to-pink-800'}`}>
            Collection Overview
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Explore and analyze your NFT collections
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {collectionFeatures.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={feature.path}>
                <FuturisticCard
                  className="h-full p-6"
                  gradient={`bg-gradient-to-br ${feature.gradient}`}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{feature.icon}</span>
                    <h2 className="text-xl font-semibold">{feature.title}</h2>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </FuturisticCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/nftmarketplace">
            <FuturisticButton
              variant="primary"
              size="large"
            >
              Explore NFT Marketplace
            </FuturisticButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionOverview;
