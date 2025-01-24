import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ModernLoader from '../ModernLoader';
import BackButton from '../../components/BackButton';
import Select from 'react-select';
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
import { Line } from 'react-chartjs-2';

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
  const [timePeriod, setTimePeriod] = useState('24h');
  const { isDark } = useTheme();

  const timeOptions = [
    { value: '24h', label: 'Last 24 Hours', description: 'Hourly trader activity from the past day' },
    { value: '7d', label: 'Last 7 Days', description: 'Daily trader activity for the week' },
    { value: '30d', label: 'Last 30 Days', description: 'Monthly trading patterns' },
    { value: 'all', label: 'All Time', description: 'Complete historical data' }
  ];

  const CustomOption = ({ innerProps, label, description, isSelected }) => (
    <div
      {...innerProps}
      className={`px-4 py-2 cursor-pointer transition-colors duration-200 ${
        isSelected 
          ? isDark 
            ? 'bg-blue-500 text-white' 
            : 'bg-blue-500 text-white'
          : isDark
            ? 'hover:bg-gray-700'
            : 'hover:bg-blue-50'
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className={`text-sm ${isSelected ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {description}
      </div>
    </div>
  );

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
          `https://api.unleashnfts.com/api/v2/nft/market-insights/traders?blockchain=full&time_range=${timePeriod}`,
          options
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

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
  }, [timePeriod]);

  const formatNumber = (value) => {
    if (!value) return '0';
    return value.toLocaleString();
  };

  const getPercentageChange = (value) => {
    if (!value) return '0%';
    const percentage = value * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    if (timePeriod === '24h') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto p-4">
          <BackButton />
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <ModernLoader />
            <div className={`mt-6 text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Loading trader insights...
            </div>
            <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Analyzing trading patterns
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto p-4">
          <BackButton />
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

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
          color: isDark ? '#e5e7eb' : '#374151',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#e5e7eb' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatNumber(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#4b5563',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#4b5563',
          callback: (value) => formatNumber(value)
        }
      }
    }
  };

  const lineChartData = {
    labels: data.block_dates.map(formatDate),
    datasets: [
      {
        label: 'Total Traders',
        data: data.traders_trend,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Buyers',
        data: data.traders_buyers_trend,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Sellers',
        data: data.traders_sellers_trend,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4">
        <BackButton />
        
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            NFT Trader Insights
          </h1>

          <div className="mb-6">
            <div className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Time Period
            </div>
            <Select
              options={timeOptions}
              value={timeOptions.find(option => option.value === timePeriod)}
              onChange={(selectedOption) => setTimePeriod(selectedOption.value)}
              components={{ Option: CustomOption }}
              className="w-full md:w-80"
              classNamePrefix="select"
              isSearchable={false}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: '#3b82f6',
                  primary75: '#60a5fa',
                  primary50: '#93c5fd',
                  primary25: '#dbeafe',
                  neutral0: isDark ? '#1f2937' : '#ffffff',
                  neutral80: isDark ? '#ffffff' : '#000000',
                },
              })}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                  '&:hover': {
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                }),
                option: (base) => ({
                  ...base,
                  padding: 0,
                }),
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Traders Card */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Total Traders</h2>
              <div className="flex flex-col items-center">
                <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(data.traders)}
                </div>
                <div className={`text-lg font-semibold ${data.traders_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {getPercentageChange(data.traders_change)}
                </div>
              </div>
            </div>

            {/* Buyers Card */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Buyers</h2>
              <div className="flex flex-col items-center">
                <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(data.traders_buyers)}
                </div>
                <div className={`text-lg font-semibold ${data.traders_buyers_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {getPercentageChange(data.traders_buyers_change)}
                </div>
              </div>
            </div>

            {/* Sellers Card */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sellers</h2>
              <div className="flex flex-col items-center">
                <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatNumber(data.traders_sellers)}
                </div>
                <div className={`text-lg font-semibold ${data.traders_sellers_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {getPercentageChange(data.traders_sellers_change)}
                </div>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} mb-6`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Trading Activity Trends</h2>
            <div className="h-[400px]">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* Market Summary */}
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Market Summary</h2>
            <div className={`space-y-4 text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {/* Overall Activity */}
              <p>
                The NFT market currently has <span className="font-medium">{formatNumber(data.traders)}</span> active traders, showing a 
                <span className={`font-medium ${data.traders_change >= 0 ? ' text-emerald-500' : ' text-rose-500'}`}>
                  {' '}{getPercentageChange(data.traders_change)}
                </span> change in total trading activity.
              </p>

              {/* Buyer/Seller Ratio */}
              <p>
                Among these traders, there are <span className="font-medium">{formatNumber(data.traders_buyers)}</span> buyers 
                (<span className={`font-medium ${data.traders_buyers_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {getPercentageChange(data.traders_buyers_change)}
                </span>) and <span className="font-medium">{formatNumber(data.traders_sellers)}</span> sellers 
                (<span className={`font-medium ${data.traders_sellers_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {getPercentageChange(data.traders_sellers_change)}
                </span>), indicating a 
                {data.traders_buyers > data.traders_sellers ? 
                  ' buyer-dominated market with higher demand.' : 
                  data.traders_buyers < data.traders_sellers ? 
                    ' seller-dominated market with increased supply.' :
                    ' balanced market between buyers and sellers.'}
              </p>

              {/* Peak Activity */}
              {(() => {
                const maxTraders = Math.max(...data.traders_trend);
                const peakIndex = data.traders_trend.indexOf(maxTraders);
                const peakTime = new Date(data.block_dates[peakIndex]);
                return (
                  <p>
                    Peak trading activity was observed at{' '}
                    <span className="font-medium">
                      {peakTime.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </span>
                    {timePeriod !== '24h' && 
                      ` on ${peakTime.toLocaleDateString([], { 
                        month: 'short', 
                        day: 'numeric' 
                      })}`
                    } with <span className="font-medium">{formatNumber(maxTraders)}</span> active traders.
                  </p>
                );
              })()}

              {/* Market Health */}
              <p>
                The current buyer-to-seller ratio is{' '}
                <span className={`font-medium ${
                  data.traders_buyers/data.traders_sellers > 1 ? 'text-emerald-500' : 
                  data.traders_buyers/data.traders_sellers === 1 ? (isDark ? 'text-gray-300' : 'text-gray-600') :
                  'text-rose-500'
                }`}>
                  {(data.traders_buyers/data.traders_sellers).toFixed(2)}
                </span>, suggesting a{' '}
                {data.traders_buyers/data.traders_sellers > 1.1 ? 'strong buying pressure' :
                 data.traders_buyers/data.traders_sellers < 0.9 ? 'strong selling pressure' :
                 'relatively balanced market'}.
              </p>

              {/* Last Updated */}
              <p className="text-sm opacity-75">
                Last updated: {new Date(data.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTTradersInsights;