import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import FuturisticLoader from './shared/FuturisticLoader';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import LoaderCard from './shared/LoaderCard';

const NftMarketplaceTraders = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [blockchainFilter, setBlockchainFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [timePeriod, setTimePeriod] = useState('24h');
  const [showFeatured, setShowFeatured] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const options = {
          method: 'GET',
          headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
        };

        const response = await fetch(
          `https://api.unleashnfts.com/api/v2/nft/marketplace/traders?blockchain=full&time_range=${timePeriod}&sort_by=name&sort_order=desc&offset=0&limit=90`,
          options
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        
        if (!result || !result.data) {
          throw new Error('Invalid data format received');
        }

        const validData = Array.isArray(result.data) ? result.data : [];
        setData(validData);
        setFilteredData(validData);

        const validSuggestions = validData
          .filter(item => item && item.traders_change !== null && item.traders_change !== undefined)
          .sort((a, b) => (b.traders_change || 0) - (a.traders_change || 0))
          .slice(0, 3);
        
        setSuggestions(validSuggestions);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setData([]);
        setFilteredData([]);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timePeriod]);

  useEffect(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    let filtered = [...data];
    
    if (blockchainFilter) {
      filtered = filtered.filter(item => item && item.blockchain === blockchainFilter);
    }
    if (nameFilter) {
      filtered = filtered.filter(item => item && item.name && item.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (suggestionFilter) {
      filtered = filtered.filter(item => item && getSuggestion(item).text === suggestionFilter);
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'traders') {
        comparison = (a.traders || 0) - (b.traders || 0);
      } else if (sortBy === 'traders_change') {
        comparison = (a.traders_change || 0) - (b.traders_change || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredData(filtered);
  }, [blockchainFilter, nameFilter, suggestionFilter, data, sortBy, sortOrder]);

  const getSuggestion = (item) => {
    if (!item || item.traders_change === null || item.traders_change === undefined) {
      return { text: "No data available", color: "text-gray-500", bgColor: "bg-gray-100" };
    }

    if (item.traders_change > 50) {
      return { text: "High trading activity, consider monitoring closely.", color: "text-red-500", bgColor: "bg-red-100" };
    } else if (item.traders_change > 20) {
      return { text: "Moderate trading activity, potential for growth.", color: "text-yellow-500", bgColor: "bg-yellow-100" };
    } else if (item.traders_change < 0) {
      return { text: "Declining trading activity, exercise caution.", color: "text-blue-500", bgColor: "bg-blue-100" };
    } else {
      return { text: "Stable trading activity.", color: "text-green-500", bgColor: "bg-green-100" };
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto p-4">
          <BackButton />
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <FuturisticLoader />
            <div className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Loading Marketplace Data...
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Please wait while we fetch the latest trading information
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <BackButton />
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-4xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}
      >
        NFT Marketplace Traders
      </motion.h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="w-full">
          <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Time Period:</label>
          <select
            className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-3 rounded-lg w-full border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition-all`}
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="w-full">
          <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Blockchain:</label>
          <select
            className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-3 rounded-lg w-full border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition-all`}
            value={blockchainFilter}
            onChange={(e) => setBlockchainFilter(e.target.value)}
          >
            <option value="">All Blockchains</option>
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
            <option value="avalanche">Avalanche</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>

        <div className="w-full">
          <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Search by Name:</label>
          <input
            type="text"
            className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-3 rounded-lg w-full border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition-all`}
            placeholder="Enter marketplace name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>

        <div className="w-full">
          <label className={`block mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Activity:</label>
          <select
            className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-3 rounded-lg w-full border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition-all`}
            value={suggestionFilter}
            onChange={(e) => setSuggestionFilter(e.target.value)}
          >
            <option value="">All Activity Levels</option>
            <option value="High trading activity, consider monitoring closely.">High Activity</option>
            <option value="Moderate trading activity, potential for growth.">Moderate Activity</option>
            <option value="Declining trading activity, exercise caution.">Declining Activity</option>
            <option value="Stable trading activity.">Stable Activity</option>
          </select>
        </div>
      </motion.div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Featured Marketplaces
          </motion.h2>
          <button
            onClick={() => setShowFeatured(!showFeatured)}
            className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-500 hover:text-white transition-colors`}
          >
            {showFeatured ? 'Hide Featured' : 'Show Featured'}
          </button>
        </div>
        
        {showFeatured && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {suggestions.map((item, index) => {
              const suggestion = getSuggestion(item);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300`}
                >
                  <div className="relative">
                    {item.thumbnail_url && (
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.name} 
                        className="w-full h-48 object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div className={`absolute top-0 right-0 m-2 px-3 py-1 rounded-full ${suggestion.bgColor} ${suggestion.color} text-sm font-semibold`}>
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                    <div className="space-y-2">
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-semibold">Blockchain:</span> {item.blockchain}
                      </p>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-semibold">Traders:</span> {item.traders?.toLocaleString()}
                      </p>
                      <p className={`${suggestion.color} font-semibold`}>
                        {item.traders_change ? `${item.traders_change.toFixed(2)}% change` : 'N/A'}
                      </p>
                    </div>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Visit Marketplace
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <div className="mb-4 flex items-center">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Marketplaces</h2>
        <div className="ml-auto flex space-x-4">
          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-1 rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-500 hover:text-white transition-colors`}
          >
            Sort by Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('traders')}
            className={`px-3 py-1 rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-500 hover:text-white transition-colors`}
          >
            Sort by Traders {sortBy === 'traders' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('traders_change')}
            className={`px-3 py-1 rounded ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-500 hover:text-white transition-colors`}
          >
            Sort by Change {sortBy === 'traders_change' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item, index) => {
          const suggestion = getSuggestion(item);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300`}
            >
              <div className="relative">
                {item.thumbnail_url && (
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.name} 
                    className="w-full h-40 object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className={`absolute top-0 right-0 m-2 px-3 py-1 rounded-full ${suggestion.bgColor} ${suggestion.color} text-sm font-semibold`}>
                  {item.traders_change > 0 ? '+' : ''}{item.traders_change?.toFixed(2)}%
                </div>
              </div>
              <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</h3>
                <div className="space-y-2">
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-semibold">Blockchain:</span> {item.blockchain}
                  </p>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-semibold">Traders:</span> {item.traders?.toLocaleString()}
                  </p>
                  <p className={`${suggestion.color} text-sm`}>{suggestion.text}</p>
                </div>
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Visit Marketplace
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default NftMarketplaceTraders;