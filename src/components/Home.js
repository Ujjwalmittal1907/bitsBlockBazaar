import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaChartLine, FaStore, FaImage, FaShieldAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { NFTInsightsAPI } from '../api/nftInsightsEndpoints';

const Home = () => {
  const { isDark } = useTheme();
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const [marketAnalytics, tradersData, scoresData] = await Promise.all([
          NFTInsightsAPI.getMarketAnalytics(),
          NFTInsightsAPI.getTradersInsights(),
          NFTInsightsAPI.getScoresInsights()
        ]);
        
        setMarketData({
          analytics: marketAnalytics.data,
          traders: tradersData.data,
          scores: scoresData.data
        });
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const panels = [
    {
      id: 'nft',
      title: 'NFT Insights',
      gradient: 'from-blue-600 to-indigo-600',
      icon: <FaChartLine className="w-8 h-8" />,
      description: 'Comprehensive NFT market analysis and insights powered by bitsCrunch',
      stats: marketData?.analytics ? [
        { 
          label: 'Market Cap', 
          value: `$${(marketData.analytics.market_cap / 1e9).toFixed(2)}B`,
          change: marketData.analytics.market_cap_change_24h
        },
        { 
          label: 'Volume 24h', 
          value: `$${(marketData.analytics.volume_24h / 1e6).toFixed(2)}M`,
          change: marketData.analytics.volume_change_24h
        }
      ] : [],
      links: [
        { title: 'Market Analytics Report', path: '/nftmarketanalyticsreport', description: 'Real-time NFT market trends and analysis' },
        { title: 'NFT Valuation Scores', path: '/nftscoresinsights', description: 'AI-powered valuation metrics for NFTs' },
        { title: 'Traders Analysis', path: '/nfttradersinsights', description: 'In-depth analysis of NFT trading patterns' },
        { title: 'Wash Trading Detection', path: '/nftwashtradeinsights', description: 'Advanced wash trading detection system' }
      ]
    },
    {
      id: 'marketplace',
      title: 'NFT Marketplace',
      gradient: 'from-indigo-600 to-purple-600',
      icon: <FaStore className="w-8 h-8" />,
      description: 'Cross-marketplace analytics and performance metrics',
      exploreButton: { path: '/nftmarketplaceoverview', label: 'Explore Marketplace Analytics' },
      stats: marketData?.traders ? [
        { 
          label: 'Active Traders', 
          value: marketData.traders.active_traders.toLocaleString(),
          change: marketData.traders.traders_change_24h
        },
        { 
          label: 'Total Volume', 
          value: `$${(marketData.traders.total_volume / 1e6).toFixed(2)}M`,
          change: marketData.traders.volume_change_24h
        }
      ] : [],
      links: [
        { title: 'Trading Analytics', path: '/marketplaceanalytics', description: 'Real-time trading metrics and volume analysis' },
        { title: 'Top Traders', path: '/marketplacetraders', description: 'Leading traders and their performance metrics' },
        { title: 'Wash Trade Detection', path: '/marketplacewashtraders', description: 'Identify suspicious trading patterns' },
        { title: 'Volume Analysis', path: '/nftmarketplace', description: 'Detailed marketplace volume breakdown' }
      ]
    },
    {
      id: 'collections',
      title: 'NFT Collections',
      gradient: 'from-purple-600 to-pink-600',
      icon: <FaImage className="w-8 h-8" />,
      description: 'In-depth NFT collection analytics and insights',
      exploreButton: { path: '/collectionoverview', label: 'Explore Collection Analytics' },
      stats: marketData?.scores ? [
        { 
          label: 'Top Collections', 
          value: marketData.scores.top_collections_count,
          change: marketData.scores.collections_change_24h
        },
        { 
          label: 'Avg Collection Score', 
          value: marketData.scores.average_score.toFixed(2),
          change: marketData.scores.score_change_24h
        }
      ] : [],
      links: [
        { title: 'Collection Analytics', path: '/collectionanalytics', description: 'Performance metrics and trend analysis' },
        { title: 'Collection Scores', path: '/collectionscores', description: 'AI-based collection rating system' },
        { title: 'Category Analysis', path: '/collectioncategories', description: 'Category-wise collection insights' },
        { title: 'Metadata Analysis', path: '/collectionmetadata', description: 'Detailed attribute and rarity analysis' },
        { title: 'Wash Trade Analysis', path: '/collectionwashtrade', description: 'Collection-specific wash trading detection' },
        { title: 'Top Traders', path: '/collectiontraders', description: 'Leading traders within collections' }
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-700/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)] animate-blob"></div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            NFT Analytics Hub
          </h1>
          <p className="text-lg mt-2 text-gray-600 dark:text-gray-300">
            Powered by bitsCrunch APIs
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Three Panel Layout */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 gap-6">
          {panels.map((panel, index) => (
            <motion.div
              key={panel.id}
              className={`flex-1 rounded-xl overflow-hidden ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Panel Header */}
              <div className={`p-6 bg-gradient-to-r ${panel.gradient} text-white`}>
                <div className="flex items-center justify-between mb-4">
                  {panel.icon}
                  <h2 className="text-2xl font-bold">{panel.title}</h2>
                </div>
                <p className="text-sm text-white/90">{panel.description}</p>
                {panel.exploreButton && (
                  <Link
                    to={panel.exploreButton.path}
                    className="inline-block mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    {panel.exploreButton.label}
                  </Link>
                )}
              </div>

              {/* Live Stats */}
              {!loading && panel.stats.length > 0 && (
                <div className="grid grid-cols-2 gap-4 p-6">
                  {panel.stats.map((stat, i) => (
                    <div key={i} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                      {stat.change !== undefined && (
                        <div className={`flex items-center text-sm ${
                          stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {stat.change >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                          {Math.abs(stat.change).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Links */}
              <div className="p-6 space-y-4">
                {panel.links.map((link, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={link.path}
                      className={`block p-4 rounded-lg ${
                        isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                      } transition-all duration-300`}
                    >
                      <h3 className="text-lg font-semibold mb-1">{link.title}</h3>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{link.description}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;