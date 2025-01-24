import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FiSearch, FiFilter, FiExternalLink, FiTwitter, FiInstagram } from 'react-icons/fi';
import { FaDiscord, FaTelegram, FaMedium } from 'react-icons/fa';
import Select from 'react-select';
import { FuturisticLoader } from './shared';

const CollectionMetadata = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { isDark } = useTheme();

  const fetchData = async (currentOffset = 0) => {
    try {
      if (currentOffset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await fetch(
        `https://api.unleashnfts.com/api/v2/nft/collection/metadata?sort_order=desc&offset=${currentOffset}&limit=90`,
        {
          headers: {
            accept: 'application/json',
            'x-api-key': process.env.REACT_APP_X_API_KEY
          }
        }
      );
      const json = await response.json();
      
      if (json.data) {
        if (currentOffset === 0) {
          setData(json.data);
        } else {
          setData(prevData => [...prevData, ...json.data]);
        }
        setHasMore(json.pagination?.has_next || false);
        setOffset(currentOffset);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchData(offset + 90);
    }
  };

  const blockchainOptions = [
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'solana', label: 'Solana' },
    { value: 'binance', label: 'Binance' },
    { value: 'bitcoin', label: 'Bitcoin' }
  ];

  const categoryOptions = [
    { value: 'games', label: 'Games' },
    { value: 'utility', label: 'Utility' },
    { value: 'art', label: 'Art' }
  ];

  const filteredData = data
    .filter(item => {
      const searchMatch = 
        (!searchTerm) ||
        (item.collection && item.collection.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.contract_address && item.contract_address.toLowerCase().includes(searchTerm.toLowerCase()));

      const blockchainMatch = 
        !selectedBlockchain || 
        (item.blockchain === selectedBlockchain.value);

      const categoryMatch = 
        !selectedCategory || 
        (item.category === selectedCategory.value);

      return searchMatch && blockchainMatch && categoryMatch;
    })
    .sort((a, b) => {
      // Score items based on completeness
      const getScore = (item) => {
        let score = 0;
        if (item.collection) score += 5;
        if (item.banner_image_url) score += 4;
        if (item.description) score += 3;
        if (item.blockchain) score += 2;
        if (item.category) score += 1;
        return score;
      };
      
      return getScore(b) - getScore(a);
    });

  const SocialLinks = ({ item }) => (
    <div className="flex space-x-3">
      {item.twitter_url && (
        <a href={item.twitter_url} target="_blank" rel="noopener noreferrer" 
           className="text-blue-400 hover:text-blue-500">
          <FiTwitter size={20} />
        </a>
      )}
      {item.discord_url && (
        <a href={item.discord_url} target="_blank" rel="noopener noreferrer" 
           className="text-indigo-400 hover:text-indigo-500">
          <FaDiscord size={20} />
        </a>
      )}
      {item.instagram_url && (
        <a href={item.instagram_url} target="_blank" rel="noopener noreferrer" 
           className="text-pink-400 hover:text-pink-500">
          <FiInstagram size={20} />
        </a>
      )}
      {item.telegram_url && (
        <a href={item.telegram_url} target="_blank" rel="noopener noreferrer" 
           className="text-blue-400 hover:text-blue-500">
          <FaTelegram size={20} />
        </a>
      )}
      {item.medium_url && (
        <a href={item.medium_url} target="_blank" rel="noopener noreferrer" 
           className="text-gray-400 hover:text-gray-500">
          <FaMedium size={20} />
        </a>
      )}
    </div>
  );

  const getBlockchainName = (blockchain) => {
    if (!blockchain) return null;
    const names = {
      'ethereum': 'Ethereum',
      'solana': 'Solana',
      'binance': 'Binance',
      'bitcoin': 'Bitcoin',
      'polygon': 'Polygon'
    };
    return names[blockchain.toLowerCase()] || blockchain;
  };

  const getCollectionName = (item) => {
    if (item.collection) return item.collection;
    if (item.contract_address) {
      return `Collection ${item.contract_address.slice(0, 6)}...${item.contract_address.slice(-4)}`;
    }
    return 'Unnamed Collection';
  };

  const CollectionCard = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-lg overflow-hidden ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        {item.banner_image_url ? (
          <img
            src={item.banner_image_url}
            alt={getCollectionName(item)}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = item.image_url || `https://via.placeholder.com/800x400/718096/FFFFFF?text=${encodeURIComponent(getCollectionName(item))}`;
            }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="text-center p-4">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={getCollectionName(item)}
                  className="w-32 h-32 object-contain mx-auto mb-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-4xl mb-2 block">🖼️</span>
              )}
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {getCollectionName(item)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {getCollectionName(item)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.blockchain && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {getBlockchainName(item.blockchain)}
                </span>
              )}
              {item.category && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
                }`}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </span>
              )}
              {item.contract_type && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'
                }`}>
                  {item.contract_type}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {item.marketplace_url && (
              <a
                href={item.marketplace_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <FiExternalLink size={20} className="text-blue-500" />
              </a>
            )}
          </div>
        </div>

        <p className={`text-sm mb-4 line-clamp-3 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {item.description || 'No description available'}
        </p>

        <div className="flex justify-between items-center">
          <SocialLinks item={item} />
          <span className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {item.contract_type || 'Unknown Type'}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const selectStyles = {
    control: (base) => ({
      ...base,
      background: isDark ? '#1F2937' : 'white',
      borderColor: isDark ? '#374151' : '#E5E7EB',
    }),
    menu: (base) => ({
      ...base,
      background: isDark ? '#1F2937' : 'white',
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused
        ? isDark ? '#374151' : '#F3F4F6'
        : isDark ? '#1F2937' : 'white',
      color: isDark ? 'white' : 'black',
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? 'white' : 'black',
    }),
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-4xl font-bold mb-8 text-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          NFT Collections
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg outline-none ${
                isDark
                  ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
                  : 'bg-white text-gray-900 placeholder-gray-400 border-gray-200'
              } border focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select
              placeholder="Blockchain"
              options={blockchainOptions}
              value={selectedBlockchain}
              onChange={setSelectedBlockchain}
              isClearable
              styles={selectStyles}
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select
              placeholder="Category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              isClearable
              styles={selectStyles}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <FuturisticLoader size="large" />
            <p className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Loading Collections...
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item, index) => (
                <CollectionCard key={`${item.collection_id}-${index}`} item={item} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } ${loadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loadingMore ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading more...
                    </span>
                  ) : (
                    'Load More Collections'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CollectionMetadata;