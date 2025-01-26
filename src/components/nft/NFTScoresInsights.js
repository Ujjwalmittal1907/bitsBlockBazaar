import React, { useState, useEffect } from 'react';
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
  Legend,
  Filler
} from 'chart.js';
import ModernLoader from '../ModernLoader';

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

const NFTScoresInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('24h');
  const [blockchain, setBlockchain] = useState('ethereum');

  const blockchainOptions = [
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'binance', label: 'Binance' },
    { value: 'full', label: 'All Blockchains' }
  ];

  const timeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const formatNumber = (num) => {
    if (!num && num !== 0) return '-';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatScore = (score) => {
    if (!score && score !== 0) return '-';
    return Number(score).toFixed(1);
  };

  const formatPercentage = (value) => {
    if (!value && value !== 0) return '-';
    return `${(Number(value) * 100).toFixed(2)}%`;
  };

  const getPercentageChange = (change) => {
    if (!change && change !== 0) return '-';
    const value = (change * 100).toFixed(1);
    return `${value}%`;
  };

  const fetchData = async () => {
    setLoading(true);
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
        `https://api.unleashnfts.com/api/v2/nft/market-insights/scores?blockchain=${blockchain}&time_range=${timePeriod}`,
        options
      );

      if (!response.ok) {
        throw new Error('Failed to fetch scores data');
      }

      const jsonData = await response.json();
      console.log('API Response:', jsonData);

      if (!jsonData.data || !jsonData.data[0]) {
        throw new Error('Invalid data format received');
      }
      
      // Extract data from the first item in the data array
      const marketData = jsonData.data[0];
      const processedData = {
        market_cap: parseFloat(marketData.market_cap),
        market_cap_change: marketData.market_cap_change,
        marketstate: marketData.marketstate,
        nft_market_fear_and_greed_index: marketData.nft_market_fear_and_greed_index,
        health_score: marketData.marketstate, // Using marketstate as health score
        volume_score: marketData.nft_market_fear_and_greed_index / 2, // Deriving volume score
        liquidity_score: (marketData.marketstate + (marketData.nft_market_fear_and_greed_index / 2)) / 2, // Deriving liquidity score
        health_score_change: marketData.market_cap_change,
        volume_score_change: marketData.market_cap_change,
        liquidity_score_change: marketData.market_cap_change,
        block_dates: marketData.block_dates || [],
        health_score_trend: marketData.marketstate_trend || [],
        volume_score_trend: marketData.nft_market_fear_and_greed_index_trend.map(v => v / 2) || [],
        liquidity_score_trend: marketData.marketstate_trend.map((v, i) => 
          (v + (marketData.nft_market_fear_and_greed_index_trend[i] / 2)) / 2
        ) || []
      };

      setData(processedData);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timePeriod, blockchain]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    switch (timePeriod) {
      case '24h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      case '7d':
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      case '30d':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  const getSummaryInsights = () => {
    if (!data) return [];

    const insights = [];
    
    // Market State
    const healthScore = Number(data.marketstate);
    insights.push({
      type: healthScore >= 70 ? 'success' : healthScore >= 50 ? 'info' : 'warning',
      text: `Market state is ${formatScore(healthScore)} - ${
        healthScore >= 70 ? 'Very bullish market' :
        healthScore >= 50 ? 'Stable market' :
        'Bearish market'
      }`
    });

    // Fear & Greed
    const fearGreedIndex = Number(data.nft_market_fear_and_greed_index);
    insights.push({
      type: fearGreedIndex >= 75 ? 'warning' : fearGreedIndex >= 50 ? 'success' : 'info',
      text: `Fear & Greed Index: ${formatScore(fearGreedIndex)} - ${
        fearGreedIndex >= 75 ? 'Extreme Greed' :
        fearGreedIndex >= 50 ? 'Greed' :
        fearGreedIndex >= 25 ? 'Fear' :
        'Extreme Fear'
      }`
    });

    // Market Cap
    const marketCapChange = data.market_cap_change;
    insights.push({
      type: marketCapChange >= 0 ? 'success' : 'warning',
      text: `Market Cap ${marketCapChange >= 0 ? 'increased' : 'decreased'} by ${formatPercentage(Math.abs(marketCapChange))} to ${formatNumber(data.market_cap)}`
    });

    return insights;
  };

  const renderChart = () => {
    if (!data || !data.block_dates || !data.health_score_trend || !data.volume_score_trend || !data.liquidity_score_trend) {
      return null;
    }

    // Reverse the arrays to show recent dates on the right
    const dates = [...data.block_dates].reverse();
    const healthScores = [...data.health_score_trend].reverse();
    const volumeScores = [...data.volume_score_trend].reverse();
    const liquidityScores = [...data.liquidity_score_trend].reverse();

    const chartData = {
      labels: dates.map(formatDate),
      datasets: [
        {
          label: 'Health Score',
          data: healthScores,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Volume Score',
          data: volumeScores,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Liquidity Score',
          data: liquidityScores,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          labels: {
            color: '#fff',
            font: {
              size: 12,
              weight: '500'
            },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#374151',
          borderWidth: 1,
          padding: 12,
          bodySpacing: 4,
          titleSpacing: 4,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          },
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y.toFixed(1);
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: '#1E293B',
            drawBorder: false,
            display: false
          },
          ticks: {
            color: '#94A3B8',
            font: {
              size: 11
            },
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 8,
            align: 'center'
          }
        },
        y: {
          grid: {
            color: '#1E293B',
            drawBorder: false
          },
          ticks: {
            color: '#94A3B8',
            font: {
              size: 11
            },
            callback: (value) => `${value}`,
            padding: 8
          },
          min: 0,
          max: 100,
          beginAtZero: true
        }
      }
    };

    return (
      <div className="h-[400px] w-full">
        <Line data={chartData} options={options} />
      </div>
    );
  };

  return (
    <div className="bg-[#0F172A] text-white p-6 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">NFT Market Health Scores</h2>
          <p className="text-gray-400 text-sm mt-1">Real-time insights into market health and sentiment</p>
        </div>
        <div className="flex gap-4">
          <Select
            value={blockchainOptions.find(option => option.value === blockchain)}
            onChange={(selectedOption) => setBlockchain(selectedOption.value)}
            options={blockchainOptions}
            className="w-48"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#1E293B',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                '&:hover': {
                  borderColor: '#4B5563'
                }
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#1E293B',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#374151' : '#1E293B',
                color: '#FFF',
                cursor: 'pointer'
              }),
              singleValue: (base) => ({
                ...base,
                color: '#FFF'
              })
            }}
          />
          <Select
            value={timeOptions.find(option => option.value === timePeriod)}
            onChange={(selectedOption) => setTimePeriod(selectedOption.value)}
            options={timeOptions}
            className="w-48"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#1E293B',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                '&:hover': {
                  borderColor: '#4B5563'
                }
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#1E293B',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#374151' : '#1E293B',
                color: '#FFF',
                cursor: 'pointer'
              }),
              singleValue: (base) => ({
                ...base,
                color: '#FFF'
              })
            }}
          />
        </div>
      </div>

      {/* Summary Insights */}
      {!loading && !error && data && (
        <div className="bg-[#1E293B] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Market Summary</h3>
          <div className="space-y-3">
            {getSummaryInsights().map((insight, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-400/10' :
                  insight.type === 'warning' ? 'bg-amber-400/10' :
                  'bg-blue-400/10'
                }`}
              >
                <span className="mt-1 text-lg">
                  {insight.type === 'success' ? '↗' :
                   insight.type === 'warning' ? '↘' : 'ℹ'}
                </span>
                <span className={`${
                  insight.type === 'success' ? 'text-green-400' :
                  insight.type === 'warning' ? 'text-amber-400' :
                  'text-blue-400'
                }`}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
          <h3 className="text-sm text-gray-400 mb-2">Health Score</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {formatScore(data?.health_score)}
              </p>
              <p className={`text-sm mt-2 flex items-center ${data?.health_score_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data?.health_score_change >= 0 ? '↑' : '↓'} {formatPercentage(data?.health_score_change)}
              </p>
            </>
          )}
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
          <h3 className="text-sm text-gray-400 mb-2">Volume Score</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {formatScore(data?.volume_score)}
              </p>
              <p className={`text-sm mt-2 flex items-center ${data?.volume_score_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data?.volume_score_change >= 0 ? '↑' : '↓'} {formatPercentage(data?.volume_score_change)}
              </p>
            </>
          )}
        </div>
        <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
          <h3 className="text-sm text-gray-400 mb-2">Liquidity Score</h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {formatScore(data?.liquidity_score)}
              </p>
              <p className={`text-sm mt-2 flex items-center ${data?.liquidity_score_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data?.liquidity_score_change >= 0 ? '↑' : '↓'} {formatPercentage(data?.liquidity_score_change)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-800">
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <ModernLoader text="Loading market health scores..." />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          renderChart()
        )}
      </div>
    </div>
  );
};

export default NFTScoresInsights;