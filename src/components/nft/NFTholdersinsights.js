import React, { useState, useEffect } from 'react';
import { NFTInsightsAPI } from '../../api/nftInsightsEndpoints';
import { useTheme } from '../../context/ThemeContext';
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

// Register ChartJS components
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

const NFTHoldersInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setData(null);
        
        const response = await NFTInsightsAPI.getHoldersInsights();
        console.log('API Response:', response); // Debug log
        
        if (response?.data?.[0]) {
          const holderData = response.data[0];
          setData(holderData);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching holders data:', err);
        setError(err.message || 'Failed to fetch holders data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state
  if (loading) {
    return <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
    </div>;
  }

  // Show error state
  if (error) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  // Show empty state
  if (!data || typeof data !== 'object') {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
        <p>No holders data available</p>
      </div>
    );
  }

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };

  const getPercentageChange = (value) => {
    if (typeof value !== 'number') return '0%';
    const change = (value * 100).toFixed(2);
    return `${change >= 0 ? '+' : ''}${change}%`;
  };

  const formatNumber = (value) => {
    if (!value) return '0';
    try {
      const num = parseInt(value);
      return isNaN(num) ? '0' : num.toLocaleString();
    } catch {
      return '0';
    }
  };

  const holdersCount = formatNumber(data.holders);
  const whalesCount = formatNumber(data.holders_whales);

  const holdersChartData = {
    labels: Array.isArray(data.block_dates) ? data.block_dates.map(formatTime) : [],
    datasets: [
      {
        label: 'Total Holders',
        data: Array.isArray(data.holders_trend) ? data.holders_trend : [],
        borderColor: isDark ? '#4F46E5' : '#4338CA',
        backgroundColor: isDark ? 'rgba(79, 70, 229, 0.1)' : 'rgba(67, 56, 202, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Whale Holders',
        data: Array.isArray(data.holders_whales_trend) ? data.holders_whales_trend : [],
        borderColor: isDark ? '#10B981' : '#059669',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#fff' : '#000',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 600
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#4B5563',
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#4B5563',
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className={`p-6 rounded-lg glass-effect ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">NFT Holders Overview</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Track holder distribution and whale activity
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-4xl font-bold gradient-text gradient-blue">
            {holdersCount}
          </p>
          <p className={`text-sm mt-1 ${data.holders_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {getPercentageChange(data.holders_change)} change
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Holders</h3>
          <p className="text-3xl font-bold gradient-text gradient-blue">
            {holdersCount}
          </p>
          <p className={`text-sm mt-2 ${data.holders_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {getPercentageChange(data.holders_change)} change
          </p>
        </div>

        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Whale Holders</h3>
          <p className="text-3xl font-bold gradient-text gradient-green">
            {whalesCount}
          </p>
          <p className={`text-sm mt-2 ${data.holders_whales_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {getPercentageChange(data.holders_whales_change)} change
          </p>
        </div>
      </div>

      <div className="h-[400px]">
        <Line options={chartOptions} data={holdersChartData} />
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Blockchain: <span className="font-medium capitalize">{data.blockchain || 'N/A'}</span></p>
        <p>Chain ID: <span className="font-medium">{data.chain_id || 'N/A'}</span></p>
      </div>
    </div>
  );
};

export default NFTHoldersInsights;