import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import FuturisticLoader from './shared/FuturisticLoader';
import { useTheme } from '../context/ThemeContext';

const NftMarketplace = () => {
  const [marketplaces, setMarketplaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    byBlockchain: {}
  });
  const { isDark } = useTheme();

  const placeholderImages = {
    ethereum: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    solana: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    polygon: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    avalanche: 'https://cryptologos.cc/logos/avalanche-avax-logo.png'
  };

  const getPlaceholderImage = (blockchain) => {
    return placeholderImages[blockchain] || 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
  };

  useEffect(() => {
    fetchMarketplaces();
  }, []);

  useEffect(() => {
    if (marketplaces.length > 0) {
      const blockchainStats = marketplaces.reduce((acc, market) => {
        acc.total++;
        acc.byBlockchain[market.blockchain] = (acc.byBlockchain[market.blockchain] || 0) + 1;
        return acc;
      }, { total: 0, byBlockchain: {} });
      setStats(blockchainStats);
    }
  }, [marketplaces]);

  const fetchMarketplaces = async () => {
    try {
      const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
      };

      const response = await fetch('https://api.unleashnfts.com/api/v2/nft/marketplace/metadata?sort_order=desc&offset=0&limit=90', options);
      const data = await response.json();
      setMarketplaces(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching marketplaces:', error);
      setLoading(false);
    }
  };

  const filteredMarketplaces = marketplaces.filter(marketplace => {
    const matchesSearch = marketplace.marketplaces.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlockchain = selectedBlockchain === 'all' || marketplace.blockchain === selectedBlockchain;
    return matchesSearch && matchesBlockchain;
  });

  const blockchains = ['all', ...new Set(marketplaces.map(m => m.blockchain))];

  const getBlockchainColor = (blockchain) => {
    const colors = {
      ethereum: '#627EEA',
      solana: '#14F195',
      polygon: '#8247E5',
      avalanche: '#E84142'
    };
    return colors[blockchain] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading NFT Marketplaces...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              NFT Marketplaces
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore {stats.total} marketplaces across multiple blockchains
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search marketplaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={selectedBlockchain}
              onChange={(e) => setSelectedBlockchain(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {blockchains.map(blockchain => (
                <option key={blockchain} value={blockchain}>
                  {blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(stats.byBlockchain).map(([blockchain, count]) => (
            <div
              key={blockchain}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
              style={{
                borderLeft: `4px solid ${getBlockchainColor(blockchain)}`
              }}
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {count}
              </p>
            </div>
          ))}
        </div>

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarketplaces.map((marketplace, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                {marketplace.image_url ? (
                  <img
                    src={marketplace.image_url}
                    alt={marketplace.marketplaces}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getPlaceholderImage(marketplace.blockchain);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <img 
                      src={getPlaceholderImage(marketplace.blockchain)}
                      alt={`${marketplace.blockchain} logo`}
                      className="w-16 h-16 mb-2 opacity-50"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {marketplace.marketplaces.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute top-0 right-0 m-2">
                  <span className="px-2 py-1 text-xs font-medium text-white rounded-full" 
                    style={{
                      backgroundColor: getBlockchainColor(marketplace.blockchain)
                    }}
                  >
                    {marketplace.blockchain}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {marketplace.marketplaces}
                  </h2>
                  <span className="px-3 py-1 text-sm font-medium text-white rounded-full" 
                    style={{
                      backgroundColor: getBlockchainColor(marketplace.blockchain)
                    }}
                  >
                    {marketplace.blockchain}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {marketplace.contract_address}
                    </p>
                  </div>
                  
                  {marketplace.external_url && (
                    <a
                      href={marketplace.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      Visit Marketplace
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMarketplaces.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No marketplaces found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NftMarketplace;
