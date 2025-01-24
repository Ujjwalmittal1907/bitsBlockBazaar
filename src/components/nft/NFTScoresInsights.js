import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ModernLoader from '../ModernLoader';
import BackButton from '../BackButton';
import Select from 'react-select';

const NFTScoresInsights = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('24h');
  const { isDark } = useTheme();

  const timeOptions = [
    { value: '24h', label: 'Last 24 Hours', description: 'View market insights from the past day' },
    { value: '7d', label: 'Last 7 Days', description: 'Analyze weekly market trends' },
    { value: '30d', label: 'Last 30 Days', description: 'Monthly market performance' },
    { value: '90d', label: 'Last 90 Days', description: 'Quarterly market overview' },
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
      setIsLoading(true);
      setError(null);
      
      try {
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-api-key': process.env.REACT_APP_X_API_KEY
          }
        };

        const response = await fetch(
          `https://api.unleashnfts.com/api/v2/nft/market-insights/scores?time_range=${timePeriod}`,
          options
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch data: ${errorText}`);
        }

        const result = await response.json();
        
        if (!result || !result.data || !result.data[0]) {
          throw new Error('Invalid data format received');
        }

        setData(result.data[0]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timePeriod]);

  const formatValue = (value, type) => {
    if (type === 'marketCap') {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    return value.toFixed(2);
  };

  const getMarketStateColor = (value) => {
    if (value >= 75) return { 
      bg: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
      text: 'text-emerald-500'
    };
    if (value >= 50) return { 
      bg: 'bg-gradient-to-r from-blue-400 to-blue-500',
      text: 'text-blue-500'
    };
    if (value >= 25) return { 
      bg: 'bg-gradient-to-r from-amber-400 to-amber-500',
      text: 'text-amber-500'
    };
    return { 
      bg: 'bg-gradient-to-r from-rose-400 to-rose-500',
      text: 'text-rose-500'
    };
  };

  const getFearGreedColor = (value) => {
    if (value > 75) return { 
      bg: 'bg-gradient-to-r from-rose-400 to-rose-500',
      text: 'text-rose-500'
    };
    if (value > 50) return { 
      bg: 'bg-gradient-to-r from-orange-400 to-orange-500',
      text: 'text-orange-500'
    };
    if (value > 25) return { 
      bg: 'bg-gradient-to-r from-amber-400 to-amber-500',
      text: 'text-amber-500'
    };
    return { 
      bg: 'bg-gradient-to-r from-blue-400 to-blue-500',
      text: 'text-blue-500'
    };
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto p-4">
          <BackButton />
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <ModernLoader />
            <div className={`mt-6 text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              Loading market insights...
            </div>
            <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Please wait while we process the market data
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4">
        <BackButton />
        
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            NFT Market Insights
          </h1>

          <div className="mb-6">
            <div className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Time Period
            </div>
            <Select
              options={timeOptions}
              value={timeOptions.find(option => option.value === timePeriod)}
              onChange={(selectedOption) => {
                console.log('Selected time period:', selectedOption.value);
                setTimePeriod(selectedOption.value);
              }}
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

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}

          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Market Cap Card */}
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Market Cap</h2>
                <div className="flex flex-col items-center">
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatValue(data.market_cap, 'marketCap')}
                  </div>
                  <div className={`text-lg font-semibold ${data.market_cap_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {data.market_cap_change >= 0 ? '↑' : '↓'} {Math.abs(data.market_cap_change * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Market State Card */}
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Market State</h2>
                <div className="flex flex-col items-center">
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4 shadow-inner">
                    <div 
                      className={`h-full ${getMarketStateColor(data.marketstate).bg} transition-all duration-500`}
                      style={{ width: `${data.marketstate}%` }}
                    />
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${getMarketStateColor(data.marketstate).text}`}>
                    {data.marketstate}
                  </div>
                  <div className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {data.marketstate >= 75 ? 'Very Strong' :
                     data.marketstate >= 50 ? 'Strong' :
                     data.marketstate >= 25 ? 'Weak' :
                     'Very Weak'}
                  </div>
                </div>
              </div>

              {/* Fear & Greed Index Card */}
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} md:col-span-2`}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Fear & Greed Index</h2>
                <div className="flex flex-col items-center">
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4 shadow-inner">
                    <div 
                      className={`h-full ${getFearGreedColor(data.nft_market_fear_and_greed_index).bg} transition-all duration-500`}
                      style={{ width: `${data.nft_market_fear_and_greed_index}%` }}
                    />
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${getFearGreedColor(data.nft_market_fear_and_greed_index).text}`}>
                    {data.nft_market_fear_and_greed_index.toFixed(2)}
                  </div>
                  <div className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {data.nft_market_fear_and_greed_index > 75 ? 'Extreme Greed' :
                     data.nft_market_fear_and_greed_index > 50 ? 'Greed' :
                     data.nft_market_fear_and_greed_index > 25 ? 'Fear' :
                     'Extreme Fear'}
                  </div>
                </div>
              </div>

              {/* Market Summary Card */}
              <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'} md:col-span-2`}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Market Summary</h2>
                <div className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  The NFT market currently shows a <span className={data.market_cap_change >= 0 ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>{data.market_cap_change >= 0 ? 'positive' : 'negative'}</span> trend with 
                  a <span className={data.market_cap_change >= 0 ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>{Math.abs(data.market_cap_change * 100).toFixed(2)}% {data.market_cap_change >= 0 ? 'increase' : 'decrease'}</span> in 
                  market cap. The market state is <span className={`font-medium ${getMarketStateColor(data.marketstate).text}`}>{
                    data.marketstate >= 75 ? 'very strong' :
                    data.marketstate >= 50 ? 'strong' :
                    data.marketstate >= 25 ? 'weak' :
                    'very weak'
                  }</span> at {data.marketstate}, while the fear & greed index indicates <span className={`font-medium ${getFearGreedColor(data.nft_market_fear_and_greed_index).text}`}>{
                    data.nft_market_fear_and_greed_index > 75 ? 'extreme greed' :
                    data.nft_market_fear_and_greed_index > 50 ? 'greed' :
                    data.nft_market_fear_and_greed_index > 25 ? 'fear' :
                    'extreme fear'
                  }</span> in the market.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTScoresInsights;