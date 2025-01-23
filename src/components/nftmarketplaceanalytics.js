import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import FuturisticLoader from './shared/FuturisticLoader';
import FuturisticCard from './shared/FuturisticCard';
import { useTheme } from '../context/ThemeContext';
import Select from 'react-select';

const NftMarketplaceAnalytics = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [metricType, setMetricType] = useState('volume');
  const [graphType, setGraphType] = useState('bar');
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    totalVolume: 0,
    totalSales: 0,
    totalTransactions: 0,
    totalTransfers: 0,
    avgVolumePerSale: 0,
    avgTransactionsPerMarketplace: 0,
    marketShare: [],
    transferEfficiency: 0,
    salesConversionRate: 0
  });
  const [marketplaceDetails, setMarketplaceDetails] = useState([]);
  const { isDark } = useTheme();

  const timeRangeOptions = [
    { value: '15m', label: 'Last 15 Minutes', description: 'Most recent marketplace activity' },
    { value: '30m', label: 'Last 30 Minutes', description: 'Short-term market trends' },
    { value: '24h', label: 'Last 24 Hours', description: 'Daily market overview' },
    { value: '7d', label: 'Last 7 Days', description: 'Weekly market analysis' },
    { value: '30d', label: 'Last 30 Days', description: 'Monthly market trends' },
    { value: '90d', label: 'Last 90 Days', description: 'Quarterly market view' },
    { value: 'all', label: 'All Time', description: 'Complete market history' }
  ];

  const getLoadingMessage = () => {
    switch(timeRange) {
      case '15m':
        return 'Analyzing last 15 minutes of marketplace data...';
      case '30m':
        return 'Processing last 30 minutes of market activity...';
      case '24h':
        return 'Gathering 24-hour marketplace performance...';
      case '7d':
        return 'Compiling weekly marketplace statistics...';
      case '30d':
        return 'Analyzing monthly marketplace trends...';
      case '90d':
        return 'Processing quarterly marketplace data...';
      case 'all':
        return 'Retrieving complete marketplace history...';
      default:
        return 'Loading marketplace analytics...';
    }
  };

  const CustomTimeRangeOption = ({ innerProps, label, description, isSelected }) => (
    <div 
      {...innerProps} 
      className={`px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer ${
        isSelected ? 'bg-blue-500 text-white' : ''
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>{description}</div>
    </div>
  );

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      background: isDark ? '#1f2937' : 'white',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      minHeight: '42px',
      '&:hover': {
        borderColor: isDark ? '#4b5563' : '#d1d5db'
      }
    }),
    menu: (base) => ({
      ...base,
      background: isDark ? '#1f2937' : 'white',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      background: isSelected 
        ? '#3b82f6'
        : isFocused 
          ? (isDark ? '#374151' : '#f3f4f6')
          : 'transparent',
      color: isSelected 
        ? 'white'
        : isDark ? 'white' : '#1f2937',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? 'white' : '#1f2937',
      fontSize: '0.95rem'
    }),
    input: (base) => ({
      ...base,
      color: isDark ? 'white' : '#1f2937'
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? '#9ca3af' : '#6b7280',
      fontSize: '0.95rem'
    })
  };

  const getTimeRangeLabel = () => {
    switch(timeRange) {
      case '15m': return 'Last 15 Minutes';
      case '30m': return 'Last 30 Minutes';
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case 'all': return 'All Time';
      default: return 'Last 24 Hours';
    }
  };

  useEffect(() => {
    const calculateMetrics = (data) => {
      const totalVolume = data.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);
      const totalSales = data.reduce((sum, item) => sum + (Number(item.sales) || 0), 0);
      const totalTransactions = data.reduce((sum, item) => sum + (Number(item.transactions) || 0), 0);
      const totalTransfers = data.reduce((sum, item) => sum + (Number(item.transfers) || 0), 0);
      
      // Calculate advanced metrics
      const avgVolumePerSale = totalSales > 0 ? totalVolume / totalSales : 0;
      const avgTransactionsPerMarketplace = data.length > 0 ? totalTransactions / data.length : 0;
      const transferEfficiency = totalTransfers > 0 ? totalTransactions / totalTransfers : 0;
      const salesConversionRate = totalTransactions > 0 ? (totalSales / totalTransactions) * 100 : 0;

      // Calculate market share percentages
      const marketShare = data
        .map(item => ({
          name: item.name,
          share: (Number(item.volume) / totalVolume) * 100
        }))
        .sort((a, b) => b.share - a.share)
        .slice(0, 5);

      setAnalyticsMetrics({
        totalVolume,
        totalSales,
        totalTransactions,
        totalTransfers,
        avgVolumePerSale,
        avgTransactionsPerMarketplace,
        marketShare,
        transferEfficiency,
        salesConversionRate
      });

      // Process marketplace details with performance indicators
      const details = data.map(item => ({
        name: item.name,
        volume: Number(item.volume) || 0,
        sales: Number(item.sales) || 0,
        transactions: Number(item.transactions) || 0,
        transfers: Number(item.transfers) || 0,
        url: item.url,
        thumbnail: item.thumbnail_url,
        efficiency: item.transactions > 0 ? item.volume / item.transactions : 0,
        marketShare: totalVolume > 0 ? ((Number(item.volume) || 0) / totalVolume) * 100 : 0,
        salesPerformance: item.transactions > 0 ? (Number(item.sales) / item.transactions) * 100 : 0
      })).sort((a, b) => b.volume - a.volume);

      setMarketplaceDetails(details);
    };

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const options = {
          method: 'GET',
          headers: {
            'x-api-key': process.env.REACT_APP_X_API_KEY
          }
        };

        const response = await fetch(
          `https://api.unleashnfts.com/api/v2/nft/marketplace/analytics?blockchain=full&time_range=${timeRange}&sort_by=name&sort_order=desc&offset=0&limit=30`,
          options
        );
        const result = await response.json();
        
        if (result.data) {
          setData(result.data);
          setFilteredData(result.data);
          calculateMetrics(result.data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const getChartData = () => {
    const sortedData = [...filteredData].sort((a, b) => {
      const valueA = Number(a[metricType]) || 0;
      const valueB = Number(b[metricType]) || 0;
      return valueB - valueA;
    });

    const topMarketplaces = sortedData.slice(0, 10);
    const labels = topMarketplaces.map(item => item.name);
    const datasets = [];

    const dataValues = topMarketplaces.map(item => Number(item[metricType]) || 0);
    const metricLabels = {
      volume: 'Volume (ETH)',
      sales: 'Sales Count',
      transactions: 'Transactions',
      transfers: 'Transfers'
    };

    datasets.push({
      label: metricLabels[metricType],
      data: dataValues,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.5)',
      borderColor: isDark ? '#3B82F6' : '#2563EB',
      borderWidth: 1
    });

    return { labels, datasets };
  };

  const getMarketShareData = () => {
    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(236, 72, 153, 0.8)'
    ];

    return {
      labels: analyticsMetrics.marketShare.map(item => item.name),
      datasets: [{
        data: analyticsMetrics.marketShare.map(item => item.share),
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 1
      }]
    };
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    const number = Number(num);
    if (number >= 1000000) return `${(number / 1000000).toFixed(2)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(2)}K`;
    return number.toFixed(2);
  };

  const formatPercentage = (num) => {
    return `${Number(num).toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <FuturisticLoader size="large" text={getLoadingMessage()} />
        <p className="text-gray-400 animate-pulse">
          {timeRange === '15m' || timeRange === '30m' 
            ? 'Processing real-time marketplace data...'
            : timeRange === '7d' || timeRange === '30d' || timeRange === '90d'
              ? 'Analyzing historical marketplace trends...'
              : 'Fetching marketplace insights...'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Time Range Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">NFT Marketplace Analytics</h2>
        <p className="text-gray-500">{getTimeRangeLabel()} Overview</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select
          className="min-w-[200px] z-10"
          options={timeRangeOptions}
          value={timeRangeOptions.find(option => option.value === timeRange)}
          onChange={(selected) => setTimeRange(selected.value)}
          placeholder={isLoading ? "Loading..." : "Select time range..."}
          isDisabled={isLoading}
          components={{ 
            Option: ({ innerProps, label, data, isSelected }) => (
              <CustomTimeRangeOption 
                innerProps={innerProps}
                label={data.label}
                description={data.description}
                isSelected={isSelected}
              />
            )
          }}
          styles={customSelectStyles}
        />

        <select
          className={`p-2 rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}
          value={metricType}
          onChange={(e) => setMetricType(e.target.value)}
        >
          <option value="volume">Volume (ETH)</option>
          <option value="sales">Sales</option>
          <option value="transactions">Transactions</option>
          <option value="transfers">Transfers</option>
        </select>

        <select
          className={`p-2 rounded ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}
          value={graphType}
          onChange={(e) => setGraphType(e.target.value)}
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
        </select>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <FuturisticCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Total Volume</h3>
            <p className="text-2xl font-bold text-blue-500">${formatNumber(analyticsMetrics.totalVolume)}</p>
            <p className="text-sm text-gray-500">{getTimeRangeLabel()}</p>
          </div>
        </FuturisticCard>
        <FuturisticCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
            <p className="text-2xl font-bold text-green-500">{formatNumber(analyticsMetrics.totalSales)}</p>
          </div>
        </FuturisticCard>
        <FuturisticCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Total Transactions</h3>
            <p className="text-2xl font-bold text-purple-500">{formatNumber(analyticsMetrics.totalTransactions)}</p>
          </div>
        </FuturisticCard>
        <FuturisticCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Transfer Efficiency</h3>
            <p className="text-2xl font-bold text-yellow-500">{formatNumber(analyticsMetrics.transferEfficiency)}</p>
          </div>
        </FuturisticCard>
        <FuturisticCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Sales Conversion</h3>
            <p className="text-2xl font-bold text-indigo-500">{formatPercentage(analyticsMetrics.salesConversionRate)}</p>
          </div>
        </FuturisticCard>
        <FuturisticCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Avg Volume/Sale</h3>
            <p className="text-2xl font-bold text-pink-500">${formatNumber(analyticsMetrics.avgVolumePerSale)}</p>
          </div>
        </FuturisticCard>
      </div>

      {/* Market Share Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FuturisticCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Market Share Distribution</h3>
            <p className="text-sm text-gray-500 mb-4">{getTimeRangeLabel()}</p>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut data={getMarketShareData()} />
            </div>
          </div>
        </FuturisticCard>

        <FuturisticCard>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Market Leaders</h3>
            <div className="space-y-4">
              {analyticsMetrics.marketShare.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-blue-500">{formatPercentage(item.share)}</span>
                </div>
              ))}
            </div>
          </div>
        </FuturisticCard>
      </div>

      {/* Performance Chart */}
      <FuturisticCard>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
          <p className="text-sm text-gray-500 mb-4">{getTimeRangeLabel()}</p>
          <div className="h-[400px]">
            {graphType === 'bar' && <Bar data={getChartData()} />}
            {graphType === 'line' && <Line data={getChartData()} />}
          </div>
        </div>
      </FuturisticCard>

      {/* Marketplace Details */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Top Performing Marketplaces</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketplaceDetails.slice(0, 6).map((marketplace, index) => (
            <FuturisticCard key={index}>
              <div className="p-4">
                <div className="flex items-center mb-3">
                  {marketplace.thumbnail && (
                    <img 
                      src={marketplace.thumbnail} 
                      alt={marketplace.name} 
                      className="w-8 h-8 rounded-full mr-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/32';
                      }}
                    />
                  )}
                  <h4 className="font-semibold">{marketplace.name}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span className="font-medium">${formatNumber(marketplace.volume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Share:</span>
                    <span className="font-medium">{formatPercentage(marketplace.marketShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Performance:</span>
                    <span className="font-medium">{formatPercentage(marketplace.salesPerformance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className="font-medium">${formatNumber(marketplace.efficiency)}</span>
                  </div>
                </div>
                {marketplace.url && (
                  <a 
                    href={marketplace.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Visit Marketplace →
                  </a>
                )}
              </div>
            </FuturisticCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NftMarketplaceAnalytics;