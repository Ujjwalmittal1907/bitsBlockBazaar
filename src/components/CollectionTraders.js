import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  FuturisticLoader, 
  FuturisticCard, 
  FuturisticTable,
  FuturisticButton 
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
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FiTrendingUp, FiTrendingDown, FiUsers } from 'react-icons/fi';
import { COLLECTION_ENDPOINTS, getApiOptions, buildUrl } from '../api/endpoints';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CollectionTraders = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [traderPattern, setTraderPattern] = useState('all');
  const [marketTrend, setMarketTrend] = useState('all');
  const [sortBy, setSortBy] = useState('traders');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          time_range: filter,
          pattern: traderPattern,
          trend: marketTrend,
          sort_by: sortBy,
          sort_order: sortOrder
        };
        
        const url = buildUrl(COLLECTION_ENDPOINTS.TRADERS, params);
        const response = await fetch(url, getApiOptions());
        const data = await response.json();
        setData(data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, traderPattern, marketTrend, sortBy, sortOrder]);

  const getSuggestions = (item) => {
    if (item.traders_change > 0.5) {
      return { message: "Significant increase in traders. Consider investigating the cause.", color: "text-red-500" };
    } else if (item.traders_change > 0.2) {
      return { message: "Moderate increase in traders. Monitor the trend.", color: "text-yellow-500" };
    } else {
      return { message: "Stable trading activity.", color: "text-green-500" };
    }
  };

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

  const getChartData = (item) => {
    return {
      labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
      datasets: [
        {
          label: 'Total Traders',
          data: item.traders_trend.slice(-7),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4,
        },
        {
          label: 'Buyers',
          data: item.traders_buyers_trend.slice(-7),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          tension: 0.4,
        },
        {
          label: 'Sellers',
          data: item.traders_sellers_trend.slice(-7),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          tension: 0.4,
        }
      ]
    };
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
    const recentTrend = item.traders_trend.slice(-6);
    const avgRecent = recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length;
    const oldTrend = item.traders_trend.slice(0, -6);
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

  const getMarketInsights = (item) => {
    const buyerToSellerRatio = item.traders_buyers / item.traders_sellers;
    const traderChange = item.traders_change;
    const recentTrend = getGrowthRate(item.traders_trend);
    
    let insights = [];
    
    // Activity Level Insights
    if (getActivityLevel(item).level === 'High') {
      insights.push({
        type: 'activity',
        message: 'High trading activity detected',
        color: 'text-red-500',
        icon: '🔥'
      });
    }
    
    // Trading Pattern Insights
    if (buyerToSellerRatio > 1.5) {
      insights.push({
        type: 'pattern',
        message: 'Strong buying pressure',
        color: 'text-green-500',
        icon: '📈'
      });
    } else if (buyerToSellerRatio < 0.67) {
      insights.push({
        type: 'pattern',
        message: 'High selling pressure',
        color: 'text-red-500',
        icon: '📉'
      });
    }
    
    // Trend Insights
    if (recentTrend > 20) {
      insights.push({
        type: 'trend',
        message: 'Rapid growth in trader activity',
        color: 'text-green-500',
        icon: '🚀'
      });
    } else if (recentTrend < -20) {
      insights.push({
        type: 'trend',
        message: 'Sharp decline in trader activity',
        color: 'text-red-500',
        icon: '⚠️'
      });
    }
    
    // Market Health
    const activityScore = getActivityScore(item);
    if (activityScore >= 80) {
      insights.push({
        type: 'health',
        message: 'Excellent market health',
        color: 'text-green-500',
        icon: '💪'
      });
    } else if (activityScore <= 40) {
      insights.push({
        type: 'health',
        message: 'Poor market health',
        color: 'text-red-500',
        icon: '🤒'
      });
    }
    
    return insights;
  };

  const generateUseCase = (item) => {
    const insights = getMarketInsights(item);
    
    return (
      <div>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Collection Details</h3>
              <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Contract Address:</span>
                  <span className="text-white font-mono text-sm">{item.contract_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Blockchain:</span>
                  <span className="text-white">{item.blockchain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white">{new Date(item.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Key Insights</h3>
              <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className={`flex items-center ${insight.color}`}>
                    <span className="mr-2">{insight.icon}</span>
                    <span>{insight.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="text-xl text-blue-500" />
                  <h4 className="font-semibold text-white">Total Traders</h4>
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(item.traders)}</p>
                <div className={`text-sm ${getChangeColor(item.traders_change)}`}>
                  {getChangeIcon(item.traders_change)}
                  {(item.traders_change * 100).toFixed(1)}% change
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="text-xl text-green-500" />
                  <h4 className="font-semibold text-white">Buyers</h4>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(item.traders_buyers)}
                </p>
                <div className={`text-sm ${getChangeColor(item.traders_buyers_change)}`}>
                  {getChangeIcon(item.traders_buyers_change)}
                  {(item.traders_buyers_change * 100).toFixed(1)}% change
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="text-xl text-red-500" />
                  <h4 className="font-semibold text-white">Sellers</h4>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(item.traders_sellers)}
                </p>
                <div className={`text-sm ${getChangeColor(item.traders_sellers_change)}`}>
                  {getChangeIcon(item.traders_sellers_change)}
                  {(item.traders_sellers_change * 100).toFixed(1)}% change
                </div>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-4">Market Metrics</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Trader Growth Rate</span>
                    <span>{getGrowthRate(item.traders_trend)}% per period</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${getGrowthRate(item.traders_trend) > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(getGrowthRate(item.traders_trend)), 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Buyer/Seller Ratio</span>
                    <span>{(item.traders_buyers / item.traders_sellers).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.min((item.traders_buyers / item.traders_sellers) * 50, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Market Activity Score</span>
                    <span>{getActivityScore(item)}/100</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${getActivityScoreColor(getActivityScore(item))}`}
                      style={{ width: `${getActivityScore(item)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="text-sm font-semibold text-white mb-2">Activity Level Breakdown</h5>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className={`p-2 rounded ${getActivityLevel(item).level === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                      High
                    </div>
                    <div className={`p-2 rounded ${getActivityLevel(item).level === 'Moderate' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-400'}`}>
                      Moderate
                    </div>
                    <div className={`p-2 rounded ${getActivityLevel(item).level === 'Low' ? 'bg-green-500/20 text-green-500' : 'bg-gray-800 text-gray-400'}`}>
                      Low
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold text-white mb-4">Trading Activity Chart</h4>
            <div className="h-[300px]">
              <Line data={getChartData(item)} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getGrowthRate = (trend) => {
    const recentValues = trend.slice(-3);
    const oldValues = trend.slice(-6, -3);
    const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const oldAvg = oldValues.reduce((a, b) => a + b, 0) / oldValues.length;
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

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <BackButton />
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-white mb-4">Collection Traders Analysis</h2>
            <p className="text-gray-400 mb-6">Analyze trading patterns, market trends, and trader activity across collections</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Total Collections</div>
                <div className="text-2xl font-bold text-white">{data?.length || 0}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">High Activity Collections</div>
                <div className="text-2xl font-bold text-red-500">
                  {data?.filter(item => getActivityLevel(item).level === 'High').length || 0}
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Most Common Pattern</div>
                <div className="text-2xl font-bold text-blue-500">
                  {data ? getMostCommonPattern(data) : '-'}
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Dominant Trend</div>
                <div className="text-2xl font-bold text-green-500">
                  {data ? getDominantTrend(data) : '-'}
                </div>
              </div>
            </div>

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

            {/* Distribution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Activity Distribution
                </h3>
                <div className="space-y-3">
                  {['High', 'Moderate', 'Low'].map(level => {
                    const count = data?.filter(item => getActivityLevel(item).level === level).length || 0;
                    const percentage = data ? (count / data.length * 100).toFixed(1) : 0;
                    const width = `${percentage}%`;
                    
                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={level === 'High' ? 'text-red-500' : level === 'Moderate' ? 'text-yellow-500' : 'text-green-500'}>
                            {level}
                          </span>
                          <span className="text-gray-400">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-full rounded-full ${
                              level === 'High' ? 'bg-red-500' : 
                              level === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">⚖️</span>
                  Trading Pattern Distribution
                </h3>
                <div className="space-y-3">
                  {['Buyer Dominated', 'Seller Dominated', 'Balanced'].map(pattern => {
                    const count = data?.filter(item => getTraderPattern(item) === pattern).length || 0;
                    const percentage = data ? (count / data.length * 100).toFixed(1) : 0;
                    const width = `${percentage}%`;
                    
                    return (
                      <div key={pattern} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{pattern}</span>
                          <span className="text-gray-400">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">📈</span>
                  Market Trend Distribution
                </h3>
                <div className="space-y-3">
                  {['Increasing', 'Decreasing', 'Stable'].map(trend => {
                    const count = data?.filter(item => getMarketTrend(item) === trend).length || 0;
                    const percentage = data ? (count / data.length * 100).toFixed(1) : 0;
                    const width = `${percentage}%`;
                    
                    return (
                      <div key={trend} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={
                            trend === 'Increasing' ? 'text-green-500' :
                            trend === 'Decreasing' ? 'text-red-500' : 'text-yellow-500'
                          }>{trend}</span>
                          <span className="text-gray-400">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-full rounded-full ${
                              trend === 'Increasing' ? 'bg-green-500' :
                              trend === 'Decreasing' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : data?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No collections found matching your criteria</p>
            </div>
          ) : (
            data
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
                  {generateUseCase(item)}
                </FuturisticCard>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionTraders;