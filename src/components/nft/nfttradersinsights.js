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

const NFTTradersInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('24h');
  const [blockchain, setBlockchain] = useState('ethereum');
  const { isDark } = useTheme();

  const timeOptions = [
    { value: '24h', label: 'Last 24H', description: 'Daily trading activity' },
    { value: '7d', label: 'Last 7D', description: 'Weekly trading patterns' },
    { value: '30d', label: 'Last 30D', description: 'Monthly trading trends' },
    { value: 'all', label: 'All Time', description: 'Historical trading data' }
  ];

  const blockchainOptions = [
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'solana', label: 'Solana' }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const getPercentageChange = (change) => {
    if (change === null || change === undefined) return null;
    const percentage = change * 100;
    return percentage ? `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%` : '0%';
  };

  const formatAxisDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    switch (timePeriod) {
      case '24h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
      case '30d':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'all':
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  const getSummaryInsights = () => {
    if (!data) return [];

    const insights = [];
    
    // Total traders insights
    const tradersChange = data.traders_change;
    if (tradersChange !== null && tradersChange !== undefined) {
      insights.push({
        type: tradersChange >= 0 ? 'success' : 'warning',
        text: `Total traders have ${tradersChange >= 0 ? 'increased' : 'decreased'} by ${getPercentageChange(tradersChange)}`
      });
    }

    // Buyers vs Sellers ratio
    if (data.traders_buyers && data.traders_sellers) {
      const buyerRatio = (data.traders_buyers / (data.traders_buyers + data.traders_sellers) * 100).toFixed(1);
      insights.push({
        type: 'info',
        text: `Buyers make up ${buyerRatio}% of total traders`
      });
    }

    // Buyer trend
    const buyerChange = data.traders_buyers_change;
    if (buyerChange !== null && buyerChange !== undefined) {
      insights.push({
        type: buyerChange >= 0 ? 'success' : 'warning',
        text: `Number of buyers has ${buyerChange >= 0 ? 'increased' : 'decreased'} by ${getPercentageChange(buyerChange)}`
      });
    }

    // Seller trend
    const sellerChange = data.traders_sellers_change;
    if (sellerChange !== null && sellerChange !== undefined) {
      insights.push({
        type: sellerChange >= 0 ? 'success' : 'warning',
        text: `Number of sellers has ${sellerChange >= 0 ? 'increased' : 'decreased'} by ${getPercentageChange(sellerChange)}`
      });
    }

    return insights;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const API_KEY = process.env.REACT_APP_X_API_KEY;
      
      if (!API_KEY) {
        throw new Error('API key is not configured. Please set REACT_APP_X_API_KEY in your environment.');
      }

      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-api-key': API_KEY
        }
      };

      const response = await fetch(
        `https://api.unleashnfts.com/api/v2/nft/market-insights/traders?blockchain=${blockchain}&time_range=${timePeriod}`,
        options
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch trader insights: ${errorText}`);
      }

      const jsonData = await response.json();
      if (!jsonData.data?.[0]) {
        throw new Error('No trading data available for the selected time range');
      }
      setData(jsonData.data[0]);
      setError(null);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timePeriod, blockchain]);

  const getLoadingMessage = () => {
    switch(timePeriod) {
      case '24h':
        return 'Analyzing last 24 hours of trading activity...';
      case '7d':
        return 'Processing weekly trading patterns...';
      case '30d':
        return 'Analyzing monthly trading trends...';
      case 'all':
        return 'Retrieving complete trading history...';
      default:
        return 'Loading trading insights...';
    }
  };

  const chartData = {
    labels: data?.block_dates?.map(date => formatAxisDate(date)) || [],
    datasets: [
      {
        label: 'Total Traders',
        data: data?.traders_trend || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Buyers',
        data: data?.traders_buyers_trend || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Sellers',
        data: data?.traders_sellers_trend || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#e2e8f0' : '#1e293b'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#e2e8f0' : '#1e293b',
        bodyColor: isDark ? '#e2e8f0' : '#1e293b',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: isDark ? '#334155' : '#e2e8f0'
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b'
        }
      },
      y: {
        grid: {
          color: isDark ? '#334155' : '#e2e8f0'
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b'
        }
      }
    }
  };

  if (loading) {
    return <ModernLoader message={getLoadingMessage()} />;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
        <p className="font-medium">Error: {error}</p>
      </div>
    );
  }

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      background: isDark ? '#1e293b' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      '&:hover': {
        borderColor: isDark ? '#475569' : '#cbd5e1'
      }
    }),
    menu: (base) => ({
      ...base,
      background: isDark ? '#1e293b' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0'
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      background: isSelected
        ? isDark ? '#3b82f6' : '#60a5fa'
        : isFocused
        ? isDark ? '#334155' : '#f1f5f9'
        : 'transparent',
      color: isSelected
        ? '#ffffff'
        : isDark ? '#e2e8f0' : '#1e293b'
    })
  };

  return (
    <div className="bg-[#0F172A] text-white p-6 rounded-xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">NFT Trader Insights</h2>
          <p className="text-slate-400 mt-1">
            {loading ? getLoadingMessage() : `Analyzing ${data?.block_dates?.length || 0} data points`}
          </p>
        </div>
        <div className="flex gap-4">
          <Select
            value={timeOptions.find(option => option.value === timePeriod)}
            onChange={(selectedOption) => setTimePeriod(selectedOption.value)}
            options={timeOptions}
            className="w-48"
            classNamePrefix="select"
            isSearchable={false}
            styles={customSelectStyles}
          />
          <Select
            value={blockchainOptions.find(option => option.value === blockchain)}
            onChange={(selectedOption) => setBlockchain(selectedOption.value)}
            options={blockchainOptions}
            className="w-48"
            classNamePrefix="select"
            isSearchable={false}
            styles={customSelectStyles}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-300">Total Traders</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{formatNumber(data?.traders || 0)}</span>
            <span className={`ml-2 text-sm ${data?.traders_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data?.traders_change)}
            </span>
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-300">Buyers</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{formatNumber(data?.traders_buyers || 0)}</span>
            <span className={`ml-2 text-sm ${data?.traders_buyers_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data?.traders_buyers_change)}
            </span>
          </div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-300">Sellers</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold text-white">{formatNumber(data?.traders_sellers || 0)}</span>
            <span className={`ml-2 text-sm ${data?.traders_sellers_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data?.traders_sellers_change)}
            </span>
          </div>
        </div>
      </div>

      {/* Market Summary */}
      <div className="p-4 rounded-xl bg-slate-800/50">
        <h3 className="text-lg font-semibold mb-3 text-slate-100">Market Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getSummaryInsights().map((insight, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                insight.type === 'warning' ? 'bg-red-500/10 border border-red-500/20' :
                insight.type === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                'bg-blue-500/10 border border-blue-500/20'
              }`}
            >
              <p className={`text-sm ${
                insight.type === 'warning' ? 'text-red-400' :
                insight.type === 'success' ? 'text-green-400' :
                'text-blue-400'
              }`}>
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl">
        <div className="h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default NFTTradersInsights;