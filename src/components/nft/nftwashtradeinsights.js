import React, { useState, useEffect } from 'react';
import { NFTInsightsAPI } from '../../api/nftInsightsEndpoints';
import { useTheme } from '../../context/ThemeContext';
import { Line } from 'react-chartjs-2';
import ModernLoader from '../ModernLoader';
import BackButton from '../../components/BackButton';
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

const NFTWashTradeInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await NFTInsightsAPI.getWashTradeInsights();
        const result = await response.json();
        if (result?.data?.[0]) {
          setData(result.data[0]);
        } else {
          setError('Invalid data format received');
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch wash trade data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <ModernLoader text="Loading Wash Trade Data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center p-4">
            No wash trade data available
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatVolume = (value) => {
    if (!value) return '$0';
    const num = parseFloat(value);
    if (isNaN(num)) return '$0';
    
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const getPercentageChange = (value) => {
    if (!value) return '0%';
    const change = (value * 100).toFixed(2);
    return `${change}%`;
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
          color: isDark ? '#fff' : '#000',
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#fff' : '#000',
        }
      },
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#fff' : '#000',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const volumeChartData = {
    labels: data.block_dates.map(formatTime),
    datasets: [
      {
        label: 'Wash Trade Volume',
        data: data.washtrade_volume_trend,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const activityChartData = {
    labels: data.block_dates.map(formatTime),
    datasets: [
      {
        label: 'Suspect Transactions',
        data: data.washtrade_suspect_transactions_trend,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Affected Assets',
        data: data.washtrade_assets_trend,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text gradient-red mb-4">
            NFT Wash Trading Monitor
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Track and analyze suspicious trading patterns
          </p>
        </div>

        {/* Wash Trade Level Indicator */}
        <div className={`card glass-effect p-6 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Wash Trade Risk Level</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Current market risk assessment
              </p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <p className={`text-4xl font-bold ${
                data.washtrade_level > 75 ? 'text-red-500' :
                data.washtrade_level > 50 ? 'text-yellow-500' :
                'text-green-500'
              }`}>
                {data.washtrade_level}
              </p>
              <p className="text-lg font-medium text-gray-500">
                Risk Score
              </p>
            </div>
          </div>
          <div className="mt-4 relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
                data.washtrade_level > 75 ? 'bg-red-500' :
                data.washtrade_level > 50 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${data.washtrade_level}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Volume */}
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Wash Trade Volume</h3>
            <p className="text-3xl font-bold gradient-text gradient-red">
              {formatVolume(data.washtrade_volume)}
            </p>
            <p className={`text-sm mt-2 ${data.washtrade_volume_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.washtrade_volume_change)} change
            </p>
          </div>

          {/* Suspect Sales */}
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Suspect Sales</h3>
            <p className="text-3xl font-bold gradient-text gradient-yellow">
              {parseInt(data.washtrade_suspect_sales).toLocaleString()}
            </p>
            <p className={`text-sm mt-2 ${data.washtrade_suspect_sales_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.washtrade_suspect_sales_change)} change
            </p>
          </div>

          {/* Affected Assets */}
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Affected Assets</h3>
            <p className="text-3xl font-bold gradient-text gradient-blue">
              {parseInt(data.washtrade_assets).toLocaleString()}
            </p>
            <p className={`text-sm mt-2 ${data.washtrade_assets_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.washtrade_assets_change)} change
            </p>
          </div>

          {/* Suspect Wallets */}
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Suspect Wallets</h3>
            <p className="text-3xl font-bold gradient-text gradient-purple">
              {parseInt(data.washtrade_wallets).toLocaleString()}
            </p>
            <p className={`text-sm mt-2 ${data.washtrade_wallets_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.washtrade_wallets_change)} change
            </p>
          </div>
        </div>

        {/* Volume Chart */}
        <div className={`card glass-effect p-6 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <h2 className="text-2xl font-bold mb-6">Wash Trade Volume Trend</h2>
          <div className="h-[400px]">
            <Line options={chartOptions} data={volumeChartData} />
          </div>
        </div>

        {/* Activity Chart */}
        <div className={`card glass-effect p-6 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <h2 className="text-2xl font-bold mb-6">Suspicious Activity Trends</h2>
          <div className="h-[400px]">
            <Line options={chartOptions} data={activityChartData} />
          </div>
        </div>

        {/* Market Details */}
        <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <h2 className="text-2xl font-bold mb-6">Market Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Blockchain</p>
              <p className="text-lg font-medium capitalize">{data.blockchain}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Chain ID</p>
              <p className="text-lg font-medium">{data.chain_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Suspect Sales Ratio</p>
              <p className="text-lg font-medium">
                {(parseFloat(data.washtrade_suspect_sales_ratio) * 100).toFixed(4)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTWashTradeInsights;