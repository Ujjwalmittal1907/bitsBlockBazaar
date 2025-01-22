import React, { useState, useEffect } from 'react';
import { NFTInsightsAPI } from '../../api/nftInsightsEndpoints';
import { useTheme } from '../../context/ThemeContext';
import { Line, Bar } from 'react-chartjs-2';
import ModernLoader from '../ModernLoader';
import BackButton from '../BackButton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
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
        setLoading(true);
        setError(null);
        
        const response = await NFTInsightsAPI.getWashTradeInsights();
        const result = await response.json();
        
        if (result?.data?.[0]) {
          setData(result.data[0]);
        } else {
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching wash trade data:', err);
        setError('Failed to fetch wash trade data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (value) => {
    if (!value) return '0';
    return Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 2
    });
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getPercentageChange = (value) => {
    if (!value) return '0%';
    const percentage = value * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <BackButton />
        <ModernLoader text="Loading Wash Trade Insights..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <BackButton />
        <div className="text-center text-red-500 p-4">
          {error}
        </div>
      </div>
    );
  }

  const volumeChartData = {
    labels: data.block_dates.map(date => {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'Wash Trade Volume (USD)',
        data: data.washtrade_volume_trend,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const metricsChartData = {
    labels: data.block_dates.map(date => {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'Suspect Transactions',
        data: data.washtrade_suspect_transactions_trend,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        type: 'line',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Affected Assets',
        data: data.washtrade_assets_trend,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        type: 'bar',
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#E5E7EB' : '#1F2937'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        titleColor: isDark ? '#E5E7EB' : '#1F2937',
        bodyColor: isDark ? '#E5E7EB' : '#1F2937',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? '#374151' : '#E5E7EB'
        },
        ticks: {
          color: isDark ? '#E5E7EB' : '#1F2937'
        }
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#E5E7EB'
        },
        ticks: {
          color: isDark ? '#E5E7EB' : '#1F2937'
        }
      }
    }
  };

  const metricsChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: isDark ? '#374151' : '#E5E7EB'
        },
        ticks: {
          color: isDark ? '#E5E7EB' : '#1F2937'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: isDark ? '#E5E7EB' : '#1F2937'
        }
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto p-4">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">NFT Wash Trade Analysis</h1>
          <p className="text-gray-500">
            Monitoring suspicious trading patterns and potential wash trading activity
          </p>
        </div>

        {/* Risk Level Indicator */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Wash Trade Risk Level</h2>
              <p className="text-gray-500">Current market risk assessment</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-red-500">{data.washtrade_level}/100</p>
              <p className="text-sm text-gray-500">Risk Score</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Wash Trade Volume</h3>
            <p className="text-3xl font-bold text-red-500">{formatCurrency(data.washtrade_volume)}</p>
            <p className={`text-sm ${data.washtrade_volume_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.washtrade_volume_change)} change
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Suspect Sales</h3>
            <p className="text-3xl font-bold text-purple-500">{formatNumber(data.washtrade_suspect_sales)}</p>
            <p className={`text-sm ${data.washtrade_suspect_sales_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.washtrade_suspect_sales_change)} change
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Affected Assets</h3>
            <p className="text-3xl font-bold text-amber-500">{formatNumber(data.washtrade_assets)}</p>
            <p className={`text-sm ${data.washtrade_assets_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.washtrade_assets_change)} change
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Suspicious Wallets</h3>
            <p className="text-3xl font-bold text-blue-500">{formatNumber(data.washtrade_wallets)}</p>
            <p className={`text-sm ${data.washtrade_wallets_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.washtrade_wallets_change)} change
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className="text-xl font-bold mb-4">Wash Trade Volume Trend</h2>
            <div className="h-[400px]">
              <Line data={volumeChartData} options={chartOptions} />
            </div>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className="text-xl font-bold mb-4">Suspicious Activity Metrics</h2>
            <div className="h-[400px]">
              <Line data={metricsChartData} options={metricsChartOptions} />
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-bold mb-4">Market Status</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-gray-500 mb-1">Blockchain</h3>
              <p className="text-lg font-semibold capitalize">{data.blockchain}</p>
              <p className="text-sm text-gray-500">Network</p>
            </div>
            <div>
              <h3 className="text-gray-500 mb-1">Chain ID</h3>
              <p className="text-lg font-semibold">{data.chain_id}</p>
              <p className="text-sm text-gray-500">Network identifier</p>
            </div>
            <div>
              <h3 className="text-gray-500 mb-1">Suspect Sales Ratio</h3>
              <p className="text-lg font-semibold">
                {(Number(data.washtrade_suspect_sales_ratio) * 100).toFixed(4)}%
              </p>
              <p className={`text-sm ${data.washtrade_suspect_sales_ratio_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getPercentageChange(data.washtrade_suspect_sales_ratio_change)} change
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTWashTradeInsights;