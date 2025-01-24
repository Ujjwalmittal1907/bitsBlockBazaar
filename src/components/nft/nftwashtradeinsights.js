import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Select from 'react-select';
import { useTheme } from '../../context/ThemeContext';
import ModernLoader from '../ModernLoader';
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

const NFTWashTradeInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('24h');
  const { isDark } = useTheme();

  const timeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPercentageChange = (change) => {
    const percentage = (change - 1) * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.REACT_APP_X_API_KEY
        }
      };

      const response = await fetch(
        `https://api.unleashnfts.com/api/v2/nft/market-insights/washtrade?blockchain=full&time_range=${timePeriod}`,
        options
      );

      if (!response.ok) {
        throw new Error('Failed to fetch wash trade insights');
      }

      const jsonData = await response.json();
      setData(jsonData.data[0]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timePeriod]);

  const getLoadingMessage = () => {
    switch(timePeriod) {
      case '24h':
        return 'Analyzing last 24 hours of wash trading activity...';
      case '7d':
        return 'Processing weekly wash trading patterns...';
      case '30d':
        return 'Analyzing monthly wash trading trends...';
      case 'all':
        return 'Retrieving complete wash trading history...';
      default:
        return 'Loading wash trading insights...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <ModernLoader text={getLoadingMessage()} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className={`text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const lineChartData = {
    labels: data.block_dates.map(date => {
      const d = new Date(date);
      return timePeriod === '24h' 
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Wash Trade Volume',
        data: data.washtrade_volume_trend,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Suspect Sales',
        data: data.washtrade_suspect_sales_trend,
        borderColor: 'rgb(244, 63, 94)',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#fff' : '#000'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
              if (context.dataset.label === 'Wash Trade Volume') {
                label += formatCurrency(context.raw);
              } else {
                label += formatNumber(context.raw);
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? '#fff' : '#000'
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? '#fff' : '#000',
          callback: function(value) {
            return formatNumber(value);
          }
        }
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">NFT Wash Trading Insights</h1>
            <div className="w-48">
              <Select
                options={timeOptions}
                value={timeOptions.find(option => option.value === timePeriod)}
                onChange={(option) => setTimePeriod(option.value)}
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable={false}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: '#3B82F6',
                    primary25: isDark ? '#374151' : '#F3F4F6',
                    neutral0: isDark ? '#1F2937' : '#FFFFFF',
                    neutral80: isDark ? '#FFFFFF' : '#000000'
                  }
                })}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Volume */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className="text-lg font-semibold mb-2">Wash Trade Volume</h3>
              <p className="text-2xl font-bold mb-2">{formatCurrency(data.washtrade_volume)}</p>
              <p className={`text-sm ${data.washtrade_volume_change > 1 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {getPercentageChange(data.washtrade_volume_change)}
              </p>
            </div>

            {/* Suspect Sales */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className="text-lg font-semibold mb-2">Suspect Sales</h3>
              <p className="text-2xl font-bold mb-2">{formatNumber(data.washtrade_suspect_sales)}</p>
              <p className={`text-sm ${data.washtrade_suspect_sales_change > 1 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {getPercentageChange(data.washtrade_suspect_sales_change)}
              </p>
            </div>

            {/* Affected Assets */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className="text-lg font-semibold mb-2">Affected Assets</h3>
              <p className="text-2xl font-bold mb-2">{formatNumber(data.washtrade_assets)}</p>
              <p className={`text-sm ${data.washtrade_assets_change > 1 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {getPercentageChange(data.washtrade_assets_change)}
              </p>
            </div>

            {/* Suspect Wallets */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className="text-lg font-semibold mb-2">Suspect Wallets</h3>
              <p className="text-2xl font-bold mb-2">{formatNumber(data.washtrade_wallets)}</p>
              <p className={`text-sm ${data.washtrade_wallets_change > 1 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {getPercentageChange(data.washtrade_wallets_change)}
              </p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} mb-6`}>
            <h2 className="text-xl font-bold mb-4">Wash Trading Activity Trends</h2>
            <div className="h-[400px]">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* Market Summary */}
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <h2 className="text-xl font-bold mb-4">Wash Trading Summary</h2>
            <div className={`space-y-4 text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {/* Overall Activity */}
              <p>
                The market currently shows <span className="font-medium">{formatNumber(data.washtrade_suspect_sales)}</span> suspect sales across{' '}
                <span className="font-medium">{formatNumber(data.washtrade_assets)}</span> assets, with a total wash trading volume of{' '}
                <span className="font-medium">{formatCurrency(data.washtrade_volume)}</span>.
              </p>

              {/* Wash Trade Level */}
              <p>
                The current wash trade level is{' '}
                <span className={`font-medium ${
                  data.washtrade_level > 50 ? 'text-rose-500' :
                  data.washtrade_level > 25 ? 'text-amber-500' :
                  'text-emerald-500'
                }`}>
                  {data.washtrade_level}
                </span>
                {data.washtrade_level > 50 ? ', indicating significant wash trading activity.' :
                 data.washtrade_level > 25 ? ', suggesting moderate wash trading concerns.' :
                 ', showing relatively low wash trading activity.'}
              </p>

              {/* Suspect Ratio */}
              <p>
                The ratio of suspect sales to total sales is{' '}
                <span className="font-medium">
                  {(data.washtrade_suspect_sales_ratio * 100).toFixed(4)}%
                </span>, showing a{' '}
                <span className={`font-medium ${data.washtrade_suspect_sales_ratio_change > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {data.washtrade_suspect_sales_ratio_change > 0 ? 'increase' : 'decrease'}
                </span> in suspicious activity.
              </p>

              {/* Wallet Activity */}
              <p>
                A total of <span className="font-medium">{formatNumber(data.washtrade_wallets)}</span> wallets have been identified in wash trading activities, with{' '}
                <span className="font-medium">{formatNumber(data.washtrade_suspect_transactions)}</span> suspect transactions.
              </p>

              {/* Last Updated */}
              <p className="text-sm opacity-75">
                Last updated: {new Date(data.block_dates[0]).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTWashTradeInsights;