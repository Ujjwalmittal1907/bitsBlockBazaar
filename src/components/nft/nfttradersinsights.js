import React, { useState, useEffect } from 'react';
import { NFTInsightsAPI } from '../../api/nftInsightsEndpoints';
import { useTheme } from '../../context/ThemeContext';
import ModernLoader from '../ModernLoader';
import BackButton from '../../components/BackButton';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const NFTTradersInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await NFTInsightsAPI.getTradersInsights();
        const result = await response.json();
        
        if (result?.data?.[0]) {
          setData(result.data[0]);
        } else {
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch trader insights');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (value) => {
    if (!value) return '0';
    return value.toLocaleString();
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
        <ModernLoader text="Loading Trader Insights..." />
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

  const lineChartData = {
    labels: data.block_dates.map(date => {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'Total Traders',
        data: data.traders_trend,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Buyers',
        data: data.traders_buyers_trend,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Sellers',
        data: data.traders_sellers_trend,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const doughnutData = {
    labels: ['Buyers', 'Sellers'],
    datasets: [{
      data: [data.traders_buyers, data.traders_sellers],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)'
      ],
      borderWidth: 1
    }]
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

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
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
          <h1 className="text-3xl font-bold mb-4">NFT Trader Insights</h1>
          <p className="text-gray-500">
            Analysis of NFT trading activity and participant behavior
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Total Traders</h3>
            <p className="text-3xl font-bold text-blue-500">{formatNumber(data.traders)}</p>
            <p className={`text-sm ${data.traders_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.traders_change)} change
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Active Buyers</h3>
            <p className="text-3xl font-bold text-emerald-500">{formatNumber(data.traders_buyers)}</p>
            <p className={`text-sm ${data.traders_buyers_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.traders_buyers_change)} change
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Active Sellers</h3>
            <p className="text-3xl font-bold text-amber-500">{formatNumber(data.traders_sellers)}</p>
            <p className={`text-sm ${data.traders_sellers_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.traders_sellers_change)} change
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} lg:col-span-2`}>
            <h2 className="text-xl font-bold mb-4">24-Hour Trading Activity</h2>
            <div className="h-[400px]">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className="text-xl font-bold mb-4">Trader Distribution</h2>
            <div className="h-[400px] flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
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
              <h3 className="text-gray-500 mb-1">Last Updated</h3>
              <p className="text-lg font-semibold">
                {new Date(data.updated_at).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Latest data timestamp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTTradersInsights;