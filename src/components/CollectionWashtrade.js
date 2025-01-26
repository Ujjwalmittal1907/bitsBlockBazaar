import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiSearch, FiFilter, FiAlertTriangle } from 'react-icons/fi';
import FuturisticLoader from './shared/FuturisticLoader';
import { COLLECTION_ENDPOINTS, getApiOptions, buildUrl } from '../api/endpoints';

const CollectionWashtrade = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [blockchain, setBlockchain] = useState('ethereum');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('washtrade_volume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [riskFilter, setRiskFilter] = useState('all');
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching wash trade data...');
        const params = {
          time_range: timeRange,
          blockchain: blockchain,
          limit: 60,
          sort_by: sortBy,
          sort_order: sortOrder
        };
        
        const url = buildUrl(COLLECTION_ENDPOINTS.WASHTRADE, params);
        const response = await fetch(url, getApiOptions());
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        console.log('API Response:', json);
        
        if (!json.data || !Array.isArray(json.data)) {
          console.error('Invalid data format:', json);
          throw new Error('Invalid data format received');
        }

        setData(json.data);
        setFilteredData(json.data);
        console.log('Data set successfully:', json.data);
      } catch (error) {
        console.error('Error fetching wash trade data:', error);
        setError(error.message);
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, blockchain, sortBy, sortOrder]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // Try parsing different date formats
        const formats = [
          timestamp.split(' ')[0], // Try date part only
          timestamp.replace('T', ' ').split('.')[0], // Try removing milliseconds
          timestamp.replace('Z', '') // Try removing timezone
        ];
        
        for (const format of formats) {
          const parsed = new Date(format);
          if (!isNaN(parsed.getTime())) {
            return new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }).format(parsed);
          }
        }
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'N/A';
    }
  };

  const getCollectionName = (item) => {
    if (item.name) return item.name;
    
    // Try to get name from metadata if available
    if (item.metadata?.name) return item.metadata.name;
    
    // Format contract address with ellipsis
    if (item.contract_address) {
      const addr = item.contract_address;
      return `Collection ${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    }
    
    return 'Unknown Collection';
  };

  const calculateRiskScore = (item) => {
    // Initialize score components
    let volumeScore = 0;
    let assetsScore = 0;
    let salesScore = 0;
    
    // Calculate volume score (0-40 points)
    const volume = Number(item.washtrade_volume) || 0;
    if (volume > 1000000) volumeScore = 40;
    else if (volume > 500000) volumeScore = 30;
    else if (volume > 100000) volumeScore = 20;
    else if (volume > 50000) volumeScore = 10;
    
    // Calculate affected assets score (0-30 points)
    const assetsRatio = item.washtrade_assets > 0 ? 
      (item.washtrade_suspect_sales / item.washtrade_assets) : 0;
    if (assetsRatio > 0.7) assetsScore = 30;
    else if (assetsRatio > 0.5) assetsScore = 20;
    else if (assetsRatio > 0.3) assetsScore = 10;
    
    // Calculate suspect sales score (0-30 points)
    const suspectSales = Number(item.washtrade_suspect_sales) || 0;
    if (suspectSales > 1000) salesScore = 30;
    else if (suspectSales > 500) salesScore = 20;
    else if (suspectSales > 100) salesScore = 10;
    
    // Calculate total risk score
    const totalScore = volumeScore + assetsScore + salesScore;
    
    // Map total score to risk levels
    if (totalScore >= 70) return 'High';
    if (totalScore >= 40) return 'Medium';
    return 'Low';
  };

  // Filter data when search term or risk filter changes
  useEffect(() => {
    if (!data) return;
    
    const filtered = data.filter(item => {
      const addressMatch = item.contract_address.toLowerCase().includes(searchTerm.toLowerCase());
      if (!addressMatch) return false;

      if (riskFilter === 'all') return true;

      const riskLevel = calculateRiskScore(item);
      return riskLevel.toLowerCase() === riskFilter.toLowerCase();
    });

    // Sort by risk score if sorting by risk
    if (sortBy === 'risk') {
      filtered.sort((a, b) => {
        const scoreA = calculateRiskScore(a);
        const scoreB = calculateRiskScore(b);
        return sortOrder === 'desc' ? scoreB.localeCompare(scoreA) : scoreA.localeCompare(scoreB);
      });
    }

    setFilteredData(filtered);
  }, [searchTerm, riskFilter, data, sortBy, sortOrder]);

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const getChangeColor = (change) => {
    if (change === null || change === undefined) return 'text-gray-500';
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getChangeIcon = (change) => {
    if (change === null || change === undefined) return null;
    return change >= 0 ? <FiTrendingUp className="inline" /> : <FiTrendingDown className="inline" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error Loading Data</h2>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">Please check your API key and try again.</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p className="text-sm">No wash trading data found for the selected time range and blockchain.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          NFT Wash Trading Monitor
        </h1>
        
        {/* Filters Section */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Time Range Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Blockchain Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Blockchain
            </label>
            <select
              value={blockchain}
              onChange={(e) => setBlockchain(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="binance">Binance</option>
              <option value="full">All Chains</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Risk Level
            </label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Risks</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="washtrade_volume">Volume</option>
              <option value="washtrade_suspect_sales">Suspect Sales</option>
              <option value="washtrade_assets">Affected Assets</option>
              <option value="risk">Risk Level</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="flex-1 min-w-[300px]">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Search Collections
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by collection name or address..."
                className={`w-full p-2 pl-10 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Risk Level Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {['High', 'Medium', 'Low'].map((risk) => {
            const count = filteredData.filter(item => calculateRiskScore(item) === risk).length;
            
            return (
              <div 
                key={risk}
                className={`p-6 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } shadow-lg border ${
                  risk === 'High' 
                    ? 'border-red-500' 
                    : risk === 'Medium'
                    ? 'border-yellow-500'
                    : 'border-green-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{risk} Risk</h3>
                  <span className={`text-2xl font-bold ${
                    risk === 'High' 
                      ? 'text-red-500' 
                      : risk === 'Medium'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}>{count}</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {risk === 'High' 
                    ? 'Collections requiring immediate attention'
                    : risk === 'Medium'
                    ? 'Collections to monitor closely'
                    : 'Collections with normal trading patterns'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Collection List */}
        <div className="space-y-4">
          {filteredData.slice(0, 10).map((item, index) => {
            const riskLevel = calculateRiskScore(item);
            const collectionName = getCollectionName(item);
            const volumeChange = item.washtrade_volume_change 
              ? (item.washtrade_volume_change * 100).toFixed(2)
              : null;

            return (
              <motion.div
                key={item.contract_address || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {collectionName}
                    </h3>
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.contract_address}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    riskLevel === 'High' 
                      ? 'bg-red-100 text-red-800' 
                      : riskLevel === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {riskLevel} Risk
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div title="Total volume of suspected wash trades">
                    <p className="text-sm text-gray-500">Suspect Volume</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(item.washtrade_volume)} ETH
                    </p>
                    {volumeChange && (
                      <p className={`text-xs ${volumeChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {volumeChange}% {volumeChange >= 0 ? '↑' : '↓'}
                      </p>
                    )}
                  </div>
                  <div title="Number of transactions flagged as potential wash trades">
                    <p className="text-sm text-gray-500">Suspect Sales</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(item.washtrade_suspect_sales)}
                    </p>
                  </div>
                  <div title="Total number of unique NFTs involved in suspected wash trades">
                    <p className="text-sm text-gray-500">Affected Assets</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatNumber(item.washtrade_assets)}
                    </p>
                  </div>
                  <div title="Most recent wash trade activity">
                    <p className="text-sm text-gray-500">Last Activity</p>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(item.block_dates?.[0])}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollectionWashtrade;