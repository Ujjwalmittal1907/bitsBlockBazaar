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
  const [timeRange, setTimeRange] = useState('24h');
  const [traderType, setTraderType] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const traderTypes = [
    { value: 'all', label: 'All Traders' },
    { value: 'whales', label: 'Whale Traders' },
    { value: 'active', label: 'Most Active' },
    { value: 'profitable', label: 'Most Profitable' }
  ];

  const metrics = [
    { value: 'volume', label: 'Trading Volume' },
    { value: 'trades', label: 'Number of Trades' },
    { value: 'profit', label: 'Profit/Loss' },
    { value: 'unique_nfts', label: 'Unique NFTs' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tradersData, washTradeData] = await Promise.all([
          NFTInsightsAPI.getTradersInsights({
            timeRange,
            traderType,
            metrics: [selectedMetric]
          }),
          NFTInsightsAPI.getWashTradeInsights({ timeRange })
        ]);
        
        if (tradersData?.data && washTradeData?.data) {
          setData({
            traders: tradersData.data,
            washTrade: washTradeData.data
          });
        } else {
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error('Error fetching traders data:', err);
        setError('Failed to fetch traders data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, traderType, selectedMetric]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#fff' : '#000'
        }
      },
      title: {
        display: true,
        text: `${metrics.find(m => m.value === selectedMetric)?.label} Analysis`,
        color: isDark ? '#fff' : '#000'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? '#fff' : '#000'
        }
      },
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? '#fff' : '#000'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDark ? '#fff' : '#000'
        }
      }
    }
  };

  if (loading) {
    return <ModernLoader text="Loading Traders Insights..." />;
  }

  if (error) {
    return (
      <div className={`text-center p-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <BackButton />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">NFT Traders Insights</h1>
        <p className="text-gray-500">
          Powered by bitsCrunch APIs - Advanced trader behavior analysis
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Time Range Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`w-full p-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300'
            }`}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Trader Type Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Trader Type</label>
          <select
            value={traderType}
            onChange={(e) => setTraderType(e.target.value)}
            className={`w-full p-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300'
            }`}
          >
            {traderTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Metric Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Metric</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className={`w-full p-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300'
            }`}
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trading Activity Stats */}
      {data?.traders?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(data.traders.stats).map(([key, value]) => (
            <div
              key={key}
              className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h3>
              <p className="text-2xl font-bold">
                {typeof value === 'number'
                  ? value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  : value}
              </p>
              {data.traders.changes?.[`${key}_change`] && (
                <div className={`flex items-center text-sm mt-2 ${
                  data.traders.changes[`${key}_change`] >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {data.traders.changes[`${key}_change`] >= 0 ? '↑' : '↓'}
                  {Math.abs(data.traders.changes[`${key}_change`]).toFixed(2)}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Trading Activity Chart */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className="text-xl font-semibold mb-4">Trading Activity</h2>
          <div className="h-[400px]">
            <Line
              options={chartOptions}
              data={{
                labels: data.traders.timeline.map(ts => new Date(ts).toLocaleString()),
                datasets: [
                  {
                    label: metrics.find(m => m.value === selectedMetric)?.label,
                    data: data.traders.values,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true
                  }
                ]
              }}
            />
          </div>
        </div>

        {/* Trader Distribution */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className="text-xl font-semibold mb-4">Trader Distribution</h2>
          <div className="h-[400px]">
            <Doughnut
              options={doughnutOptions}
              data={{
                labels: ['Whales', 'Regular Traders', 'New Traders', 'Inactive'],
                datasets: [{
                  data: [
                    data.traders.distribution.whales,
                    data.traders.distribution.regular,
                    data.traders.distribution.new,
                    data.traders.distribution.inactive
                  ],
                  backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ]
                }]
              }}
            />
          </div>
        </div>
      </div>

      {/* Wash Trading Analysis */}
      {data?.washTrade && (
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}>
          <h2 className="text-xl font-semibold mb-4">Wash Trading Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Wash Trade Volume</h3>
              <div className="text-2xl font-bold">
                ${data.washTrade.volume.toLocaleString()}
              </div>
              <div className={`text-sm mt-1 ${
                data.washTrade.volume_percentage <= 5 ? 'text-green-500' :
                data.washTrade.volume_percentage <= 15 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {data.washTrade.volume_percentage.toFixed(2)}% of Total Volume
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Suspicious Traders</h3>
              <div className="text-2xl font-bold">
                {data.washTrade.suspicious_traders.toLocaleString()}
              </div>
              <div className={`text-sm mt-1 ${
                data.washTrade.suspicious_percentage <= 3 ? 'text-green-500' :
                data.washTrade.suspicious_percentage <= 10 ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {data.washTrade.suspicious_percentage.toFixed(2)}% of Total Traders
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Risk Level</h3>
              <div className={`text-xl font-medium ${
                data.washTrade.risk_level === 'low' ? 'text-green-500' :
                data.washTrade.risk_level === 'medium' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {data.washTrade.risk_level.charAt(0).toUpperCase() + data.washTrade.risk_level.slice(1)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Based on pattern analysis
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Traders Table */}
      <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Top Traders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Wallet Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Profit/Loss</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Trades</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data.traders.top.map((trader, index) => (
                <tr key={trader.address} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono">
                    {`${trader.address.slice(0, 6)}...${trader.address.slice(-4)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${trader.volume.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    trader.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {trader.profit_loss >= 0 ? '+' : '-'}
                    ${Math.abs(trader.profit_loss).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trader.trades.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`px-2 py-1 rounded text-sm inline-block ${
                      trader.success_rate >= 70 ? 'bg-green-500/20 text-green-500' :
                      trader.success_rate >= 50 ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {trader.success_rate.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NFTTradersInsights;