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

  const getWashTradeSeverity = (volume, assetsRatio) => {
    if (volume > 100000 && assetsRatio > 0.5) return 'High';
    if (volume > 50000 && assetsRatio > 0.3) return 'Medium';
    return 'Low';
  };

  const calculateRiskScore = (item) => {
    const totalAssets = item.washtrade_assets || 0;
    const suspectSales = item.washtrade_suspect_sales || 0;
    const volume = item.washtrade_volume || 0;
    const assetsRatio = totalAssets > 0 ? suspectSales / totalAssets : 0;
    return { 
      severity: getWashTradeSeverity(volume, assetsRatio),
      score: (volume * 0.4) + (assetsRatio * 0.6) // Weighted risk score
    };
  };

  // Filter data when search term or risk filter changes
  useEffect(() => {
    if (!data) return;
    
    const filtered = data.filter(item => {
      const addressMatch = item.contract_address.toLowerCase().includes(searchTerm.toLowerCase());
      if (!addressMatch) return false;

      if (riskFilter === 'all') return true;

      const { severity } = calculateRiskScore(item);
      return severity.toLowerCase() === riskFilter.toLowerCase();
    });

    // Sort by risk score if sorting by risk
    if (sortBy === 'risk') {
      filtered.sort((a, b) => {
        const scoreA = calculateRiskScore(a).score;
        const scoreB = calculateRiskScore(b).score;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
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

  const getSummaryAndSuggestions = (item) => {
    const totalAssets = item.washtrade_assets;
    const suspectSales = item.washtrade_suspect_sales;
    const volume = item.washtrade_volume;
    const assetsRatio = suspectSales / totalAssets;
    const severity = getWashTradeSeverity(volume, assetsRatio);
    
    let summary = '';
    let suggestions = [];

    // Generate summary based on metrics
    if (severity === 'High') {
      summary = 'Significant wash trading activity detected';
      suggestions = [
        'Monitor closely for price manipulation',
        'Exercise caution when trading',
        'Review recent transaction history'
      ];
    } else if (severity === 'Medium') {
      summary = 'Moderate wash trading patterns observed';
      suggestions = [
        'Consider waiting for market stabilization',
        'Track daily volume changes',
        'Compare with similar collections'
      ];
    } else {
      summary = 'Low wash trading activity';
      suggestions = [
        'Continue regular monitoring',
        'Watch for sudden changes in patterns',
        'Normal trading activity recommended'
      ];
    }

    return { summary, suggestions, severity };
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
          Collection Wash Trading Analysis
        </h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by contract address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* Risk Filter */}
          <div className="flex gap-4">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="risk">Sort by Risk Level</option>
              <option value="washtrade_volume">Sort by Volume</option>
              <option value="washtrade_assets">Sort by Assets</option>
              <option value="washtrade_suspect_sales">Sort by Suspect Sales</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="desc">Highest First</option>
              <option value="asc">Lowest First</option>
            </select>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                timeRange === option.value
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
          {searchTerm && ` for "${searchTerm}"`}
        </div>

        {/* Risk Distribution */}
        <div className="mb-6 p-4 rounded-lg bg-opacity-10 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}">
          <h3 className="text-lg font-semibold mb-3">Risk Distribution</h3>
          <div className="flex gap-4">
            {['High', 'Medium', 'Low'].map(level => {
              const count = filteredData.filter(
                item => calculateRiskScore(item).severity === level
              ).length;
              const percentage = (count / filteredData.length * 100) || 0;
              
              return (
                <div 
                  key={level}
                  className={`flex-1 p-3 rounded-lg ${
                    level === 'High' 
                      ? 'bg-red-500/10' 
                      : level === 'Medium'
                      ? 'bg-yellow-500/10'
                      : 'bg-green-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiAlertTriangle className={
                      level === 'High' 
                        ? 'text-red-500' 
                        : level === 'Medium'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    } />
                    <span className="font-semibold">{level} Risk</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm opacity-70">
                      {percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid gap-6">
          {filteredData.map((item, index) => (
            <motion.div
              key={item.contract_address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-6 rounded-lg ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-lg`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Risk Score */}
                <div>
                  <div className={`flex items-center gap-2 mb-3 ${
                    calculateRiskScore(item).severity === 'High'
                      ? 'text-red-500'
                      : calculateRiskScore(item).severity === 'Medium'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}>
                    <FiAlertTriangle className="text-2xl" />
                    <div>
                      <h3 className="text-lg font-semibold">Risk Score</h3>
                      <p className="text-sm">
                        {calculateRiskScore(item).severity} Risk Level
                      </p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        calculateRiskScore(item).severity === 'High'
                          ? 'bg-red-500'
                          : calculateRiskScore(item).severity === 'Medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${(calculateRiskScore(item).score / 150000) * 100}%`,
                        transition: 'width 0.5s ease-in-out'
                      }}
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Collection Info</h3>
                  <p className="text-sm text-gray-500">Contract: {item.contract_address}</p>
                  <p className="text-sm text-gray-500">Blockchain: {item.blockchain}</p>
                </div>

                {/* Wash Trade Volume */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Wash Trade Volume</h3>
                  <p className="text-xl">${formatNumber(item.washtrade_volume)}</p>
                  <div className={`text-sm ${getChangeColor(item.washtrade_volume_change)}`}>
                    {getChangeIcon(item.washtrade_volume_change)}
                    {formatNumber(item.washtrade_volume_change * 100)}% change
                  </div>
                </div>

                {/* Suspect Sales */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Suspect Sales</h3>
                  <p className="text-xl">{formatNumber(item.washtrade_suspect_sales)} / {formatNumber(item.washtrade_assets)}</p>
                  <div className={`text-sm ${getChangeColor(item.washtrade_suspect_sales_change)}`}>
                    {getChangeIcon(item.washtrade_suspect_sales_change)}
                    {formatNumber(item.washtrade_suspect_sales_change * 100)}% change
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {((item.washtrade_suspect_sales / item.washtrade_assets) * 100).toFixed(1)}% of total assets
                  </div>
                </div>
              </div>

              {/* Trend Data */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">24 Hour Trend</h4>
                <div className="grid grid-cols-24 gap-1 h-20">
                  {JSON.parse(item.washtrade_assets_trend).map((value, i) => (
                    <div
                      key={i}
                      className="bg-blue-500 rounded"
                      style={{
                        height: `${(value / Math.max(...JSON.parse(item.washtrade_assets_trend))) * 100}%`,
                        opacity: 0.7
                      }}
                      title={`${item.block_dates[i]}: ${value} assets`}
                    />
                  ))}
                </div>
              </div>

              {/* Summary and Suggestions */}
              {(() => {
                const { summary, suggestions, severity } = getSummaryAndSuggestions(item);
                return (
                  <div className="mt-6 border-t border-gray-700/20 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-lg font-semibold">Analysis</h4>
                      <span className={`px-2 py-1 rounded text-sm ${
                        severity === 'High' 
                          ? 'bg-red-500/10 text-red-500' 
                          : severity === 'Medium'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {severity} Risk
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {summary}
                    </p>

                    <div>
                      <h5 className="text-sm font-semibold mb-2">Suggestions:</h5>
                      <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionWashtrade;