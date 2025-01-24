import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaChartLine, FaStore, FaImage, FaShieldAlt, FaArrowUp, FaArrowDown, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { NFTInsightsAPI } from '../api/nftInsightsEndpoints';
import { FuturisticLoader } from './shared';

const Home = () => {
  const { isDark } = useTheme();
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Welcome to NFT Insights..." />
      </div>
    );
  }

  const panels = [
    {
      id: 'nft',
      title: 'NFT Insights',
      gradient: 'from-blue-600 to-indigo-600',
      icon: <FaChartLine className="w-8 h-8" />,
      description: 'Comprehensive NFT market analysis and insights powered by bitsCrunch',
      stats: marketData?.analytics && marketData.analytics.market_cap > 0 ? [
        { 
          label: 'Market Cap', 
          value: `$${((marketData.analytics.market_cap) / 1e9).toFixed(2)}B`,
          change: marketData.analytics.market_cap_change_24h
        },
        { 
          label: 'Volume 24h', 
          value: `$${((marketData.analytics.volume_24h) / 1e6).toFixed(2)}M`,
          change: marketData.analytics.volume_change_24h
        }
      ] : [],
      links: [
        { title: 'NFT Market Analytics Report', path: '/nftmarketanalyticsreport', description: 'Comprehensive market analysis', highlight: true },
        { title: 'NFT Wash Trading Insights', path: '/nftwashtradeinsights', description: 'Wash trading pattern detection', highlight: true },
        { title: 'NFT Scores Insights', path: '/nftscoresinsights', description: 'AI-powered NFT scoring metrics' },
        { title: 'NFT Traders Insights', path: '/nfttradersinsights', description: 'Trader behavior analysis' }
      ]
    },
    {
      id: 'marketplace',
      title: 'NFT Marketplace',
      gradient: 'from-indigo-600 to-purple-600',
      icon: <FaStore className="w-8 h-8" />,
      description: 'Cross-marketplace analytics and performance metrics',
      exploreButton: { path: '/nftmarketplaceoverview', label: 'Explore Marketplace Analytics' },
      stats: marketData?.traders && marketData.traders.active_traders > 0 ? [
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
        { title: 'NFT Marketplaces', path: '/nftmarketplace', description: 'NFT Marketplaces' },
        { title: 'NFT Marketplace Analytics', path: '/marketplaceanalytics', description: 'Real-time trading metrics and volume analysis', highlight: true },
        { title: 'Marketplace Wash Trading Analysis', path: '/marketplacewashtraders', description: 'Identify suspicious trading patterns', highlight: true },
        { title: 'Marketplace Traders Analysis', path: '/marketplacetraders', description: 'Leading traders and their performance metrics' }
      ]
    },
    {
      id: 'collections',
      title: 'NFT Collections',
      gradient: 'from-purple-600 to-pink-600',
      icon: <FaImage className="w-8 h-8" />,
      description: 'In-depth NFT collection analytics and insights',
      exploreButton: { path: '/collectionoverview', label: 'Explore Collection Analytics' },
      stats: marketData?.scores && marketData.scores.top_collections_count > 0 ? [
        { 
          label: 'Top Collections', 
          value: marketData.scores.top_collections_count.toLocaleString(),
          change: marketData.scores.collections_change_24h
        },
        { 
          label: 'Avg Collection Score', 
          value: marketData.scores.average_score.toFixed(2),
          change: marketData.scores.score_change_24h
        }
      ] : [],
      links: [
        { title: 'NFT Collection Metadata', path: '/collectionmetadata', description: 'NFT Collections' },
        { title: 'Collection Analytics Overview', path: '/collectionanalytics', description: 'Performance metrics and trend analysis', highlight: true },
        { title: 'Collection Wash Trade Analysis', path: '/collectionwashtrade', description: 'Collection-specific wash trading detection', highlight: true },
        { title: 'Collection Traders Analysis', path: '/collectiontraders', description: 'Leading traders within collections' },
        { title: 'Collection Score Analysis', path: '/collectionscores', description: 'AI-based collection rating system' },
        { title: 'Collection Category Analysis', path: '/collectioncategories', description: 'Category-wise collection insights' }
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

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center py-8">
            <div className={`text-lg ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </div>
          </div>
        )}

        {/* Three Panel Layout */}
        {!error && (
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
                {panel.stats.length > 0 && (
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
                            {Math.abs(stat.change * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation Links */}
                <div className="p-6 space-y-4">
                  {panel.links.map((link, i) => {
                    const isHighlighted = link.title.toLowerCase().includes('analytics') || 
                                        link.title.toLowerCase().includes('wash trad');
                    return (
                      <Link
                        key={i}
                        to={link.path}
                        className={`block p-4 rounded-lg transition-all duration-200 ${
                          isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-semibold mb-1 flex items-center">
                              {link.title}
                              {isHighlighted && (
                                <FaStar 
                                  className={`ml-2 ${
                                    isDark ? 'text-yellow-500' : 'text-yellow-500'
                                  } animate-pulse`}
                                  size={14}
                                />
                              )}
                            </h3>
                            <p className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {link.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;