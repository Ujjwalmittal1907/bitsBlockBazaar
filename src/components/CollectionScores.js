import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ModernLoader from './ModernLoader';
import Select from 'react-select';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CollectionScores = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('minting_revenue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [timePeriod, setTimePeriod] = useState('30d');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const processData = (data) => {
    if (!data) return [];
    
    return data
      .filter(item => item && item.contract_address)
      .map(item => ({
        ...item,
        market_cap: parseFloat(item.market_cap) || 0,
        price_avg: parseFloat(item.price_avg) || 0,
        price_ceiling: parseFloat(item.price_ceiling) || 0,
        minting_revenue: parseFloat(item.minting_revenue) || 0,
        royalty_price: parseFloat(item.royalty_price) || 0,
        marketcap_change: parseFloat(item.marketcap_change) || 0,
        price_avg_change: parseFloat(item.price_avg_change) || 0
      }))
      .sort((a, b) => {
        const getValue = (item) => {
          switch (sortBy) {
            case 'market_cap':
              return item.market_cap;
            case 'price_avg':
              return item.price_avg;
            case 'price_ceiling':
              return item.price_ceiling;
            case 'minting_revenue':
              return item.minting_revenue;
            default:
              return item.market_cap;
          }
        };
        
        const aValue = getValue(a);
        const bValue = getValue(b);
        
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-api-key': process.env.REACT_APP_X_API_KEY
          }
        };

        const response = await fetch(
          `https://api.unleashnfts.com/api/v2/nft/collection/scores?blockchain=full&time_range=${timePeriod}&sort_by=${sortBy}&limit=90`,
          options
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        
        if (result?.data) {
          setData(processData(result.data));
        } else {
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch collection scores');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod, sortBy, sortOrder]);

  const getLoadingMessage = () => {
    const messages = [
      'Analyzing NFT collections...',
      'Calculating market trends...',
      'Processing blockchain data...',
      'Fetching collection metrics...'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const sortOptions = [
    { value: 'minting_revenue', label: 'Minting Revenue' },
    { value: 'price_avg', label: 'Average Price' },
    { value: 'price_ceiling', label: 'Price Ceiling' },
    { value: 'market_cap', label: 'Market Cap' }
  ];

  const timeOptions = [
    { value: '30d', label: 'Last 30 Days' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const generateTrendChart = (item) => {
    if (!item?.avg_usd_trend) return null;

    try {
      const trendData = JSON.parse(item.avg_usd_trend);
      const dates = item.block_dates.map(date => new Date(date).toLocaleTimeString());
      
      if (trendData.every(val => val === 0)) return null;

      const chartData = {
        labels: dates,
        datasets: [{
          label: 'Price Trend',
          data: trendData,
          fill: false,
          borderColor: isDark ? '#60A5FA' : '#2563EB',
          tension: 0.1
        }]
      };

      const options = {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: isDark ? '#9CA3AF' : '#4B5563'
            },
            grid: {
              color: isDark ? '#374151' : '#E5E7EB'
            }
          },
          x: {
            display: false
          }
        }
      };

      return (
        <div className="h-32 mt-4">
          <Line data={chartData} options={options} />
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  const formatNumber = (value) => {
    if (!value || isNaN(value)) return '0';
    const num = parseFloat(value);
    if (num === 0) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatChange = (value) => {
    if (!value || isNaN(value) || value === 'nan') return '--';
    const num = parseFloat(value);
    return (num > 0 ? '+' : '') + num.toFixed(2) + '%';
  };

  const getTrendColor = (value) => {
    if (!value || isNaN(value) || value === 'nan') return isDark ? 'text-gray-400' : 'text-gray-600';
    const num = parseFloat(value);
    if (num > 0) return 'text-green-500';
    if (num < 0) return 'text-red-500';
    return isDark ? 'text-gray-400' : 'text-gray-600';
  };

  const generateUseCase = (item) => {
    if (!item) return null;

    // Format contract address for display
    const formatAddress = (address) => {
      if (!address) return 'Unknown';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
      <div key={item.contract_address} className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {formatAddress(item.contract_address)}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {(item.blockchain || 'Unknown').toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ${formatNumber(item.market_cap)}
              </p>
              <p className={`text-sm ${getTrendColor(item.marketcap_change)}`}>
                {formatChange(item.marketcap_change)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Price</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ${formatNumber(item.price_avg)}
              </p>
              <p className={`text-sm ${getTrendColor(item.price_avg_change)}`}>
                {formatChange(item.price_avg_change)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Price Ceiling</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ${formatNumber(item.price_ceiling)}
              </p>
            </div>
          </div>

          {parseFloat(item.minting_revenue) > 0 && (
            <div className="mt-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Minting Revenue</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ${formatNumber(item.minting_revenue)}
              </p>
            </div>
          )}

          {item.royalty_price && parseFloat(item.royalty_price) > 0 && (
            <div className="mt-4">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Royalty Price</p>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ${formatNumber(item.royalty_price)}
              </p>
            </div>
          )}
        </div>
        {generateTrendChart(item)}
      </div>
    );
  };

  const getSuggestions = (item) => {
    if (item.price_avg_change > 0.5) {
      return { message: "Significant increase in average price. Consider investigating the cause.", color: "text-red-500" };
    } else if (item.price_avg_change > 0.2) {
      return { message: "Moderate increase in average price. Monitor the trend.", color: "text-yellow-500" };
    } else {
      return { message: "Stable average price.", color: "text-green-500" };
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className={`mb-4 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
          isDark 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-white text-gray-800 hover:bg-gray-50'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Collection Overview
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
          <p className="text-sm">Please check your API key and try again.</p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Collection Scores
        </h2>
        <div className="flex flex-wrap gap-4">
          <Select
            value={timeOptions.find(option => option.value === timePeriod)}
            onChange={(option) => setTimePeriod(option.value)}
            options={timeOptions}
            className="w-48"
            classNamePrefix="select"
            isSearchable={false}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: '#3B82F6',
                primary25: '#BFDBFE',
                neutral0: isDark ? '#1F2937' : 'white',
                neutral80: isDark ? 'white' : 'black',
              },
            })}
          />
          <Select
            value={sortOptions.find(option => option.value === sortBy)}
            onChange={(option) => setSortBy(option.value)}
            options={sortOptions}
            className="w-48"
            classNamePrefix="select"
            isSearchable={false}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: '#3B82F6',
                primary25: '#BFDBFE',
                neutral0: isDark ? '#1F2937' : 'white',
                neutral80: isDark ? 'white' : 'black',
              },
            })}
          />
          <button
            onClick={() => setSortOrder(order => order === 'desc' ? 'asc' : 'desc')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' 
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <ModernLoader text={getLoadingMessage()} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map(item => generateUseCase(item))}
        </div>
      )}
    </div>
  );
};

export default CollectionScores;