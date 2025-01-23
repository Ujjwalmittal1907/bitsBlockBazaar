import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  FuturisticLoader, 
  FuturisticCard, 
  FuturisticTable,
  FuturisticInput,
  FuturisticButton 
} from './shared';
import BackButton from './BackButton';

const NftMarketplaceHolders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [blockchainFilter, setBlockchainFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { isDark } = useTheme();

  const addFilterOptions = useCallback(() => {
    if (data && data.length > 0) {
      const sortedData = data
        .filter(item => item.holders_change !== null && item.holders_change !== undefined)
        .sort((a, b) => b.holders_change - a.holders_change);
      setSuggestions(sortedData.slice(0, 3));
    }
  }, [data]);

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/marketplace/holders?blockchain=ethereum&time_range=24h&sort_by=name&sort_order=desc&offset=0&limit=30', options)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setFilteredData(res.data);
        addFilterOptions();
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  }, [addFilterOptions]);

  const getSuggestion = (item) => {
    if (item.holders_change > 50) {
      return { text: "High holder activity, consider monitoring closely.", color: "text-red-500" };
    } else if (item.holders_change > 20) {
      return { text: "Moderate holder activity, potential for growth.", color: "text-yellow-500" };
    } else if (item.holders_change < 0) {
      return { text: "Declining holder activity, exercise caution.", color: "text-blue-500" };
    } else {
      return { text: "Stable holder activity.", color: "text-green-500" };
    }
  };

  const filterAndSortCollections = useCallback(() => {
    let filtered = data;
    if (blockchainFilter) {
      filtered = filtered.filter(item => item.blockchain === blockchainFilter);
    }
    if (nameFilter) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (suggestionFilter) {
      filtered = filtered.filter(item => getSuggestion(item).text === suggestionFilter);
    }
    setFilteredData(filtered);
  }, [blockchainFilter, nameFilter, suggestionFilter, data, getSuggestion]);

  useEffect(() => {
    filterAndSortCollections();
  }, [filterAndSortCollections]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Loading Holders Data..." />
      </div>
    );
  }

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Blockchain', accessor: 'blockchain' },
    { header: 'Holders', accessor: 'holders' },
    { header: 'Holders Change', accessor: 'holders_change' }
  ];

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r 
            ${isDark ? 'from-blue-400 to-purple-600' : 'from-blue-600 to-purple-800'}`}>
            NFT Marketplace Holders
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Track and analyze NFT holder distribution and portfolio values
          </p>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-4 mb-6">
            <FuturisticCard className="flex-1 p-4" gradient="bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <h3 className="text-lg font-semibold mb-2">Total Holders</h3>
              <p className="text-2xl font-bold">{data.length}</p>
            </FuturisticCard>
            
            <FuturisticCard className="flex-1 p-4" gradient="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <h3 className="text-lg font-semibold mb-2">Total Value Locked</h3>
              <p className="text-2xl font-bold">$1,500,000</p>
            </FuturisticCard>
            
            <FuturisticCard className="flex-1 p-4" gradient="bg-gradient-to-br from-pink-500/10 to-red-500/10">
              <h3 className="text-lg font-semibold mb-2">Average Holdings</h3>
              <p className="text-2xl font-bold">142 Tokens</p>
            </FuturisticCard>
          </div>

          <div className="mb-6">
            <FuturisticInput
              type="text"
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="mb-6 flex justify-between">
            <div className="w-1/3 pr-2">
              <label className="block mb-2">Filter by Blockchain:</label>
              <select
                className="bg-gray-800 p-2 rounded w-full"
                value={blockchainFilter}
                onChange={(e) => setBlockchainFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="ethereum">Ethereum</option>
                <option value="solana">Solana</option>
                <option value="avalanche">Avalanche</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>
            <div className="w-1/3 px-2">
              <label className="block mb-2">Filter by Suggestion:</label>
              <select
                className="bg-gray-800 p-2 rounded w-full"
                value={suggestionFilter}
                onChange={(e) => setSuggestionFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="High holder activity, consider monitoring closely.">High holder activity</option>
                <option value="Moderate holder activity, potential for growth.">Moderate holder activity</option>
                <option value="Declining holder activity, exercise caution.">Declining holder activity</option>
                <option value="Stable holder activity.">Stable holder activity</option>
              </select>
            </div>
          </div>

          <FuturisticCard className="overflow-hidden">
            <FuturisticTable
              columns={columns}
              data={filteredData}
              onRowClick={(row) => console.log('Clicked row:', row)}
              className="w-full"
            />
          </FuturisticCard>
        </motion.div>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <FuturisticButton
            variant="primary"
            size="large"
            onClick={() => console.log('Export data')}
          >
            Export Holders Data
          </FuturisticButton>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-400">Top Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((item, index) => {
              const suggestion = getSuggestion(item);
              return (
                <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
                  <h2 className="text-xl font-bold mb-2 text-white">{item.name}</h2>
                  <p className="text-gray-400">Blockchain: {item.blockchain}</p>
                  <p className="text-gray-400">Holders: {item.holders}</p>
                  <p className="text-gray-400">Holders Change: {item.holders_change ? item.holders_change.toFixed(2) + '%' : 'N/A'}</p>
                  <p className={`text-gray-400 ${suggestion.color}`}>Suggestion: {suggestion.text}</p>
                  {item.url && (
                    <p className="text-gray-400">
                      URL: <a href={item.url} className="text-blue-400" target="_blank" rel="noopener noreferrer">{item.url}</a>
                    </p>
                  )}
                  {item.thumbnail_url && (
                    <img src={item.thumbnail_url} alt={item.name} className="mt-4 rounded" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <BackButton />
        </motion.div>
      </div>
    </div>
  );
};

export default NftMarketplaceHolders;