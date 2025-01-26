import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  FuturisticLoader, 
  FuturisticCard, 
  FuturisticTable,
  FuturisticButton,
  FuturisticTooltip 
} from './shared';
import BackButton from './BackButton';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { COLLECTION_ENDPOINTS, getApiOptions, buildUrl } from '../api/endpoints';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const CollectionTraders = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [traderPattern, setTraderPattern] = useState('all');
  const [marketTrend, setMarketTrend] = useState('all');
  const [sortBy, setSortBy] = useState('traders');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [viewMode, setViewMode] = useState('summary');
  const { isDark } = useTheme();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        blockchain: 'ethereum',
        offset: 0,
        limit: 30,
        sort_by: sortBy,
        time_range: '24h',
        sort_order: sortOrder
      };
      
      const url = buildUrl(COLLECTION_ENDPOINTS.TRADERS, params);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-api-key': '3e736dba7151eb8de28a065916dc9d70'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      
      const jsonData = await response.json();
      console.log('API Response:', jsonData);
      
      if (!jsonData.data || !Array.isArray(jsonData.data)) {
        throw new Error('Invalid data format received from API');
      }

      // Transform the data to ensure all required fields exist
      const transformedData = jsonData.data.map(item => ({
        ...item,
        traders: item.traders || 0,
        traders_buyers: item.traders_buyers || 0,
        traders_sellers: item.traders_sellers || 0,
        traders_change: item.traders_change || 0,
        name: item.name || item.contract_address?.slice(0, 8) || 'Unknown',
        contract_address: item.contract_address || '',
        block_dates: Array.isArray(item.block_dates) ? item.block_dates : [],
        traders_trend: Array.isArray(item.traders_trend) ? item.traders_trend : []
      }));

      setData(transformedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add data validation check
  const hasValidData = data && Array.isArray(data) && data.length > 0;

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getChangeColor = (change) => {
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500';
  };

  const getChangeIcon = (change) => {
    if (change > 0) {
      return <FiTrendingUp className="inline mr-1" />;
    } else if (change < 0) {
      return <FiTrendingDown className="inline mr-1" />;
    }
    return null;
  };

  const getActivityLevel = (item) => {
    const totalTraders = item.traders;
    const buyerToSellerRatio = item.traders_buyers / item.traders_sellers;
    const traderChange = item.traders_change;

    if (totalTraders > 1000 && traderChange > 2) {
      return { level: 'High', color: 'text-red-500' };
    } else if (totalTraders > 500 && traderChange > 1) {
      return { level: 'Moderate', color: 'text-yellow-500' };
    } else {
      return { level: 'Low', color: 'text-green-500' };
    }
  };

  const getTraderPattern = (item) => {
    const buyerToSellerRatio = item.traders_buyers / item.traders_sellers;
    
    if (buyerToSellerRatio > 1.5) {
      return 'Buyer Dominated';
    } else if (buyerToSellerRatio < 0.67) {
      return 'Seller Dominated';
    } else {
      return 'Balanced';
    }
  };

  const getMarketTrend = (item) => {
    // Check if traders_trend exists and is an array
    if (!Array.isArray(item?.traders_trend)) {
      return 'Unknown';
    }

    const recentTrend = item.traders_trend.slice(-6);
    // Check if we have enough data points
    if (recentTrend.length === 0) {
      return 'Unknown';
    }

    const avgRecent = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;
    const oldTrend = item.traders_trend.slice(0, -6);
    
    // If we don't have older data for comparison, return based on recent trend only
    if (oldTrend.length === 0) {
      const firstValue = recentTrend[0];
      const lastValue = recentTrend[recentTrend.length - 1];
      if (lastValue > firstValue * 1.2) {
        return 'Increasing';
      } else if (lastValue < firstValue * 0.8) {
        return 'Decreasing';
      } else {
        return 'Stable';
      }
    }

    const avgOld = oldTrend.reduce((a, b) => a + b, 0) / oldTrend.length;

    if (avgRecent > avgOld * 1.2) {
      return 'Increasing';
    } else if (avgRecent < avgOld * 0.8) {
      return 'Decreasing';
    } else {
      return 'Stable';
    }
  };

  const getMostCommonPattern = (data) => {
    const patterns = data.map(item => getTraderPattern(item));
    const counts = {};
    patterns.forEach(pattern => {
      counts[pattern] = (counts[pattern] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(counts));
    const mostCommonPattern = Object.keys(counts).find(pattern => counts[pattern] === maxCount);
    return mostCommonPattern;
  };

  const getDominantTrend = (data) => {
    const trends = data.map(item => getMarketTrend(item));
    const counts = {};
    trends.forEach(trend => {
      counts[trend] = (counts[trend] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(counts));
    const dominantTrend = Object.keys(counts).find(trend => counts[trend] === maxCount);
    return dominantTrend;
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        padding: 12,
        bodySpacing: 6,
        titleSpacing: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatNumber(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11
          },
          callback: function(value) {
            return formatNumber(value);
          }
        }
      }
    }
  };

  const getGrowthRate = (trend) => {
    // Check if trend is an array and has enough data points
    if (!Array.isArray(trend) || trend.length < 6) {
      return '0.0';
    }

    const recentValues = trend.slice(-3);
    const oldValues = trend.slice(-6, -3);

    // Ensure we have valid numbers in both arrays
    if (recentValues.some(v => typeof v !== 'number') || oldValues.some(v => typeof v !== 'number')) {
      return '0.0';
    }

    const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const oldAvg = oldValues.reduce((a, b) => a + b, 0) / oldValues.length;

    // Avoid division by zero
    if (oldAvg === 0) {
      return recentAvg > 0 ? '100.0' : '0.0';
    }

    return ((recentAvg - oldAvg) / oldAvg * 100).toFixed(1);
  };

  const getActivityScore = (item) => {
    const traderScore = Math.min(item.traders / 1000 * 40, 40);
    const growthScore = Math.min(Math.abs(item.traders_change * 100), 30);
    const balanceScore = Math.min(30 - Math.abs((item.traders_buyers / item.traders_sellers - 1) * 15), 30);
    return Math.round(traderScore + growthScore + balanceScore);
  };

  const getActivityScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const CollectionTradersComponent = ({ data }) => {
    if (!data || !Array.isArray(data)) return null;

    // Get the first item which has the most recent data
    const item = data[0];
    if (!item) return null;

    const formatNumber = (num) => {
      if (num === undefined || num === null) return '0';
      return new Intl.NumberFormat('en-US').format(num);
    };

    const formatPercentage = (value) => {
      if (!value) return '0%';
      const percent = (value * 100).toFixed(1);
      return percent > 0 ? `+${percent}%` : `${percent}%`;
    };

    const getActivityStatus = () => {
      const buyerRatio = item.traders_buyers / item.traders_sellers;
      const totalChange = item.traders_change;

      if (buyerRatio > 1.5 && totalChange > 0) return { text: 'High Buying Activity', color: 'text-green-500', bgColor: 'bg-green-100' };
      if (buyerRatio < 0.67 && totalChange < 0) return { text: 'High Selling Activity', color: 'text-red-500', bgColor: 'bg-red-100' };
      if (buyerRatio > 1.2) return { text: 'Moderate Buying', color: 'text-blue-500', bgColor: 'bg-blue-100' };
      if (buyerRatio < 0.8) return { text: 'Moderate Selling', color: 'text-orange-500', bgColor: 'bg-orange-100' };
      return { text: 'Balanced Trading', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    };

    const getChartData = () => {
      if (!item.block_dates || !item.traders_trend) return null;

      const dates = [...item.block_dates].sort((a, b) => new Date(a) - new Date(b));
      const sortedIndices = item.block_dates.map((_, i) => i)
        .sort((a, b) => new Date(item.block_dates[a]) - new Date(item.block_dates[b]));

      return {
        labels: dates.map(date => new Date(date).toLocaleTimeString()),
        datasets: [
          {
            label: 'Buyers',
            data: sortedIndices.map(i => item.traders_buyers_trend[i]),
            borderColor: '#22c55e',
            backgroundColor: '#22c55e',
            tension: 0.4
          },
          {
            label: 'Sellers',
            data: sortedIndices.map(i => item.traders_sellers_trend[i]),
            borderColor: '#ef4444',
            backgroundColor: '#ef4444',
            tension: 0.4
          }
        ]
      };
    };

    const activityStatus = getActivityStatus();
    const chartData = getChartData();

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Activity</h2>
          <span className={`px-4 py-2 rounded-full ${activityStatus.bgColor} ${activityStatus.color} text-sm font-medium`}>
            {activityStatus.text}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Traders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(item.traders)}</p>
              </div>
              <FiUsers className="text-2xl text-blue-500" />
            </div>
            <div className={`mt-2 text-sm ${item.traders_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(item.traders_change)} from previous period
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Buyers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(item.traders_buyers)}</p>
              </div>
              <FiTrendingUp className="text-2xl text-green-500" />
            </div>
            <div className={`mt-2 text-sm ${item.traders_buyers_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(item.traders_buyers_change)} from previous period
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Sellers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(item.traders_sellers)}</p>
              </div>
              <FiTrendingDown className="text-2xl text-red-500" />
            </div>
            <div className={`mt-2 text-sm ${item.traders_sellers_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(item.traders_sellers_change)} from previous period
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData && (
          <div className="mt-8 h-[300px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">24-Hour Trading Activity</h3>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  intersect: false,
                  mode: 'index'
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(156, 163, 175, 0.1)'
                    },
                    ticks: {
                      color: '#9CA3AF'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: '#9CA3AF',
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: '#9CA3AF'
                    }
                  }
                }
              }}
            />
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(item.updated_at).toLocaleString()}
        </div>
      </div>
    );
  };

  const exportData = () => {
    if (!data) return;

    const csvContent = [
      // CSV Headers
      ['Collection Address', 'Total Traders', 'Active Buyers', 'Active Sellers', 'Trader Change %', 'Activity Level', 'Trading Pattern', 'Market Trend'].join(','),
      // CSV Data
      ...data.map(item => [
        item.address,
        item.traders,
        item.traders_buyers,
        item.traders_sellers,
        (item.traders_change * 100).toFixed(2),
        getActivityLevel(item).level,
        getTraderPattern(item),
        getMarketTrend(item)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `collection_traders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <BackButton />
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Collection Traders Analysis</h2>
                <p className="text-gray-400 mt-2">
                  {hasValidData 
                    ? `Analyzing ${data.length} collections over the last 24 hours` 
                    : loading 
                      ? 'Loading collections...' 
                      : 'No collections available'}
                </p>
                {lastUpdated && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <FuturisticTooltip content="Toggle View Mode">
                  <button
                    onClick={() => setViewMode(v => v === 'summary' ? 'detailed' : 'summary')}
                    className="p-2 bg-gray-800 rounded-lg text-purple-500 hover:bg-gray-700 transition-colors"
                  >
                    {viewMode === 'summary' ? 'Show Details' : 'Show Summary'}
                  </button>
                </FuturisticTooltip>
                <FuturisticTooltip content="Refresh Data">
                  <button
                    onClick={fetchData}
                    className="p-2 bg-gray-800 rounded-lg text-blue-500 hover:bg-gray-700 transition-colors"
                    disabled={loading}
                  >
                    <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </FuturisticTooltip>
                <FuturisticTooltip content="Export to CSV">
                  <button
                    onClick={exportData}
                    className="p-2 bg-gray-800 rounded-lg text-green-500 hover:bg-gray-700 transition-colors"
                    disabled={!data || loading}
                  >
                    <FiDownload className="w-5 h-5" />
                  </button>
                </FuturisticTooltip>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-6">
                <p className="font-medium">Error loading data</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-2 text-sm text-red-200 hover:text-red-100 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Summary View */}
            {viewMode === 'summary' && hasValidData && !loading && (
              <>
                {/* Market Overview Card */}
                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Market Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm">Market Activity</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {data.reduce((sum, item) => sum + (item.traders || 0), 0).toLocaleString()} Traders
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Total active traders across all collections</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Buyer/Seller Ratio</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {(data.reduce((sum, item) => sum + (item.traders_buyers || 0), 0) / 
                          Math.max(1, data.reduce((sum, item) => sum + (item.traders_sellers || 0), 0))).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {data.reduce((sum, item) => sum + (item.traders_buyers || 0), 0) > 
                         data.reduce((sum, item) => sum + (item.traders_sellers || 0), 0)
                          ? 'Buyer-dominated market'
                          : 'Seller-dominated market'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Market Trend</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {getDominantTrend(data)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Based on trading activity patterns
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <FuturisticCard className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Top Collections</h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-gray-400 mb-3">Most Active Collections</p>
                        <div className="space-y-3">
                          {data.slice(0, 5).map(item => (
                            <div key={item.address} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                              <div>
                                <span className="text-white font-medium">{item.name}</span>
                                <p className="text-sm text-gray-400 mt-1">
                                  {item.traders_buyers} buyers, {item.traders_sellers} sellers
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-blue-500 font-bold">{formatNumber(item.traders)}</span>
                                <p className={`text-sm ${item.traders_change > 0 ? 'text-green-500' : 'text-red-500'} mt-1`}>
                                  {(item.traders_change * 100).toFixed(1)}% change
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-3">Trading Patterns</p>
                        <div className="grid grid-cols-3 gap-4">
                          {['Buyer Dominated', 'Balanced', 'Seller Dominated'].map(pattern => {
                            const count = data.filter(item => getTraderPattern(item) === pattern).length;
                            const percentage = (count / data.length * 100).toFixed(1);
                            return (
                              <div key={pattern} className="bg-gray-700/50 p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-400">{pattern}</p>
                                <p className="text-lg font-bold text-white mt-1">{percentage}%</p>
                                <p className="text-xs text-gray-500">{count} collections</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </FuturisticCard>

                  <FuturisticCard className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Market Insights</h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-gray-400 mb-3">Activity Distribution</p>
                        <div className="space-y-3">
                          {['High', 'Moderate', 'Low'].map(level => {
                            const collections = data.filter(item => getActivityLevel(item).level === level);
                            const percentage = (collections.length / data.length * 100).toFixed(1);
                            const totalTraders = collections.reduce((sum, item) => sum + item.traders, 0);
                            return (
                              <div key={level} className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span className={`font-medium ${
                                    level === 'High' ? 'text-red-500' : 
                                    level === 'Moderate' ? 'text-yellow-500' : 
                                    'text-green-500'
                                  }`}>{level} Activity</span>
                                  <span className="text-white">{percentage}%</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                  <span>{collections.length} collections</span>
                                  <span>{formatNumber(totalTraders)} traders</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                                  <div
                                    className={`h-full rounded-full ${
                                      level === 'High' ? 'bg-red-500' : 
                                      level === 'Moderate' ? 'bg-yellow-500' : 
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-3">Market Health Indicators</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm text-gray-400">Average Traders per Collection</p>
                            <p className="text-lg font-bold text-white mt-1">
                              {formatNumber(data.reduce((sum, item) => sum + item.traders, 0) / data.length)}
                            </p>
                          </div>
                          <div className="bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm text-gray-400">Growth Rate</p>
                            <p className={`text-lg font-bold mt-1 ${
                              data.reduce((sum, item) => sum + item.traders_change, 0) > 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {(data.reduce((sum, item) => sum + item.traders_change, 0) / data.length * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FuturisticCard>
                </div>
              </>
            )}

            {/* Detailed View */}
            {viewMode === 'detailed' && (
              <>
                {/* Filters */}
                <div className="bg-gray-800 p-6 rounded-lg mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Filter & Search</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Sort By</label>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="traders">Total Traders</option>
                          <option value="traders_buyers">Buyers</option>
                          <option value="traders_sellers">Sellers</option>
                          <option value="traders_change">Change %</option>
                        </select>
                        <button
                          className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600"
                          onClick={() => setSortOrder(order => order === 'desc' ? 'asc' : 'desc')}
                          title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                        >
                          {sortOrder === 'desc' ? '↓' : '↑'}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Activity Level</label>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="all">All Levels</option>
                        <option value="high">High Activity</option>
                        <option value="moderate">Moderate Activity</option>
                        <option value="low">Low Activity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Trading Pattern</label>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={traderPattern}
                        onChange={(e) => setTraderPattern(e.target.value)}
                      >
                        <option value="all">All Patterns</option>
                        <option value="buyer">Buyer Dominated</option>
                        <option value="seller">Seller Dominated</option>
                        <option value="balanced">Balanced Trading</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Market Trend</label>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={marketTrend}
                        onChange={(e) => setMarketTrend(e.target.value)}
                      >
                        <option value="all">All Trends</option>
                        <option value="increasing">Increasing</option>
                        <option value="decreasing">Decreasing</option>
                        <option value="stable">Stable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Search</label>
                      <input
                        type="text"
                        placeholder="Contract address..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Collection Cards */}
                <div className="space-y-6">
                  {data
                    ?.filter(item => {
                      if (filter === 'all') return true;
                      const activity = getActivityLevel(item).level.toLowerCase();
                      return filter === activity;
                    })
                    ?.filter(item => {
                      if (traderPattern === 'all') return true;
                      const pattern = getTraderPattern(item).toLowerCase();
                      return traderPattern === 'buyer' && pattern === 'buyer dominated' ||
                             traderPattern === 'seller' && pattern === 'seller dominated' ||
                             traderPattern === 'balanced' && pattern === 'balanced';
                    })
                    ?.filter(item => {
                      if (marketTrend === 'all') return true;
                      const trend = getMarketTrend(item).toLowerCase();
                      return marketTrend === trend;
                    })
                    ?.filter(item => 
                      item.contract_address.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    ?.sort((a, b) => {
                      if (sortBy === 'traders') {
                        return sortOrder === 'desc' ? b.traders - a.traders : a.traders - b.traders;
                      } else if (sortBy === 'traders_buyers') {
                        return sortOrder === 'desc' ? b.traders_buyers - a.traders_buyers : a.traders_buyers - b.traders_buyers;
                      } else if (sortBy === 'traders_sellers') {
                        return sortOrder === 'desc' ? b.traders_sellers - a.traders_sellers : a.traders_sellers - b.traders_sellers;
                      } else if (sortBy === 'traders_change') {
                        return sortOrder === 'desc' ? b.traders_change - a.traders_change : a.traders_change - b.traders_change;
                      }
                    })
                    ?.map(item => (
                      <FuturisticCard key={item.contract_address} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <CollectionTradersComponent data={[item]} />
                      </FuturisticCard>
                    ))}
                </div>
              </>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="mt-4 text-gray-400">Loading collection data...</p>
              </div>
            ) : !hasValidData && !error ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No collections found</p>
                <button
                  onClick={fetchData}
                  className="mt-4 text-blue-500 hover:text-blue-400"
                >
                  Refresh data
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionTraders;