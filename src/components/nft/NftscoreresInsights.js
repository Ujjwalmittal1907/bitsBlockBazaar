import React, { useState, useEffect } from 'react';
import { NFTInsightsAPI } from '../../api/nftInsightsEndpoints';
import { useTheme } from '../../context/ThemeContext';
import ModernLoader from '../ModernLoader';
import BackButton from '../../components/BackButton';

const NFTScoresInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await NFTInsightsAPI.getScoresInsights();
        const result = await response.json();
        if (result?.data?.[0]) {
          setData(result.data[0]);
        } else {
          setError('Invalid data format received');
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch market scores');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <BackButton />
        <ModernLoader text="Loading Market Scores..." />
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

  if (!data) {
    return (
      <div className="container mx-auto p-4">
        <BackButton />
        <div className="text-center p-4">
          No market scores available
        </div>
      </div>
    );
  }

  const formatMarketCap = (value) => {
    if (!value) return '$0';
    const num = parseFloat(value);
    if (isNaN(num)) return '$0';
    
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    return `$${num.toFixed(2)}`;
  };

  const getPercentageChange = (value) => {
    if (!value) return '0%';
    return `${(value * 100).toFixed(2)}%`;
  };

  const getFearGreedCategory = (score) => {
    if (score >= 80) return { label: 'Extreme Greed', color: 'red' };
    if (score >= 60) return { label: 'Greed', color: 'orange' };
    if (score >= 40) return { label: 'Neutral', color: 'yellow' };
    if (score >= 20) return { label: 'Fear', color: 'blue' };
    return { label: 'Extreme Fear', color: 'purple' };
  };

  const getMarketStateCategory = (score) => {
    if (score >= 80) return { label: 'Very Bullish', color: 'green' };
    if (score >= 60) return { label: 'Bullish', color: 'green' };
    if (score >= 40) return { label: 'Neutral', color: 'yellow' };
    if (score >= 20) return { label: 'Bearish', color: 'red' };
    return { label: 'Very Bearish', color: 'red' };
  };

  const renderGauge = (value, max, color) => {
    const percentage = (value / max) * 100;
    return (
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full bg-${color}-500 transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const fearGreedCategory = getFearGreedCategory(data.nft_market_fear_and_greed_index);
  const marketStateCategory = getMarketStateCategory(data.marketstate);

  return (
    <div className="container mx-auto p-4">
      <BackButton />
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text gradient-blue mb-4">
              NFT Market Sentiment
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Track market sentiment and key indicators
            </p>
          </div>

          {/* Fear & Greed Index */}
          <div className={`card glass-effect p-6 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Fear & Greed Index</h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current market sentiment indicator
                </p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className={`text-4xl font-bold text-${fearGreedCategory.color}-500`}>
                  {data.nft_market_fear_and_greed_index.toFixed(1)}
                </p>
                <p className={`text-lg font-medium text-${fearGreedCategory.color}-500`}>
                  {fearGreedCategory.label}
                </p>
              </div>
            </div>
            {renderGauge(data.nft_market_fear_and_greed_index, 100, fearGreedCategory.color)}
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-purple-500">Extreme Fear</span>
              <span className="text-blue-500">Fear</span>
              <span className="text-yellow-500">Neutral</span>
              <span className="text-orange-500">Greed</span>
              <span className="text-red-500">Extreme Greed</span>
            </div>
          </div>

          {/* Market State */}
          <div className={`card glass-effect p-6 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Market State</h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Overall market condition
                </p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className={`text-4xl font-bold text-${marketStateCategory.color}-500`}>
                  {data.marketstate}
                </p>
                <p className={`text-lg font-medium text-${marketStateCategory.color}-500`}>
                  {marketStateCategory.label}
                </p>
              </div>
            </div>
            {renderGauge(data.marketstate, 100, marketStateCategory.color)}
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-red-500">Very Bearish</span>
              <span className="text-red-400">Bearish</span>
              <span className="text-yellow-500">Neutral</span>
              <span className="text-green-400">Bullish</span>
              <span className="text-green-500">Very Bullish</span>
            </div>
          </div>

          {/* Market Cap */}
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h2 className="text-2xl font-bold mb-6">Market Cap</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-bold gradient-text gradient-green">
                  {formatMarketCap(data.market_cap)}
                </p>
                <p className={`text-sm mt-2 ${data.market_cap_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {getPercentageChange(data.market_cap_change)} change
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Market Details</h3>
                <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default NFTScoresInsights;