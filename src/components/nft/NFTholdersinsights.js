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
import ModernLoader from '../ModernLoader';

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
        const response = await NFTInsightsAPI.getHoldersInsights();
        const result = await response.json();
        if (result?.data?.[0]) {
          setData(result.data[0]);
        } else {
          setError('Invalid data format received');
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch holders data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ModernLoader text="Loading Holders Data..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-4">
        No holders data available
      </div>
    );
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const holdersChartData = {
    labels: data.block_dates.map(formatTime),
    datasets: [
      {
        label: 'Total Holders',
        data: data.holders_trend,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Active Holders',
        data: data.active_holders_trend,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const distributionChartData = {
    labels: data.block_dates.map(formatTime),
    datasets: [
      {
        label: 'Large Holders',
        data: data.large_holders_trend,
        borderColor: 'rgb(234, 179, 8)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Medium Holders',
        data: data.medium_holders_trend,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Small Holders',
        data: data.small_holders_trend,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text gradient-blue mb-4">
            NFT Holders Analysis
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Monitor NFT holder distribution and behavior
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Holders */}
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Total Holders</h3>
            <p className="text-3xl font-bold gradient-text gradient-blue">
              {data.total_holders.toLocaleString()}
            </p>
            <p className={`text-sm mt-2 ${data.holders_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.holders_change)} change
            </p>
          </div>

          {/* Active Holders */}
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Active Holders</h3>
            <p className="text-3xl font-bold gradient-text gradient-green">
              {data.active_holders.toLocaleString()}
            </p>
            <p className={`text-sm mt-2 ${data.active_holders_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.active_holders_change)} change
            </p>
          </div>

          {/* Large Holders */}
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Large Holders</h3>
            <p className="text-3xl font-bold gradient-text gradient-yellow">
              {data.large_holders.toLocaleString()}
            </p>
            <p className={`text-sm mt-2 ${data.large_holders_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.large_holders_change)} change
            </p>
          </div>

          {/* Holder Concentration */}
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Holder Concentration</h3>
            <p className="text-3xl font-bold gradient-text gradient-purple">
              {getPercentageChange(data.holder_concentration)}
            </p>
            <p className={`text-sm mt-2 ${data.holder_concentration_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.holder_concentration_change)} change
            </p>
          </div>
        </div>

        {/* Holders Trend Chart */}
        <div className={`card glass-effect p-6 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <h2 className="text-2xl font-bold mb-6">Holders Activity Trend</h2>
          <div className="h-[400px]">
            <Line options={chartOptions} data={holdersChartData} />
          </div>
        </div>

        {/* Distribution Chart */}
        <div className={`card glass-effect p-6 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <h2 className="text-2xl font-bold mb-6">Holder Distribution Trend</h2>
          <div className="h-[400px]">
            <Line options={chartOptions} data={distributionChartData} />
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
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-lg font-medium">
                {new Date(data.block_dates[0]).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTHoldersInsights;