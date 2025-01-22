import React, { useState, useEffect } from 'react';
import { NFTInsightsAPI } from '../../api/nftInsightsEndpoints';
import { useTheme } from '../../context/ThemeContext';
import ModernLoader from '../ModernLoader';

const NFTMarketAnalyticsReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState('line');
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await NFTInsightsAPI.getMarketAnalytics();
        const result = await response.json();
        if (result?.data?.[0]) {
          setData(result.data[0]);
        } else {
          setError('Invalid data format received');
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch market analytics');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ModernLoader text="Loading Market Analytics..." />;
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
        No market analytics available
      </div>
    );
  }

  const formatNumber = (value, isPrice = false) => {
    if (!value) return '0';
    value = parseFloat(value);
    if (isNaN(value)) return '0';
    
    if (isPrice) {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(2)}K`;
      }
      return `$${value.toFixed(2)}`;
    }
    
    return value.toLocaleString();
  };

  const getPercentageChange = (value) => {
    if (!value) return '0%';
    return `${(value * 100).toFixed(2)}%`;
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'volume':
        return {
          trend: data.volume_trend,
          label: 'Volume',
          color: 'blue',
          current: data.volume,
          change: data.volume_change,
          isPrice: true
        };
      case 'sales':
        return {
          trend: data.sales_trend,
          label: 'Sales',
          color: 'green',
          current: data.sales,
          change: data.sales_change,
          isPrice: false
        };
      case 'transactions':
        return {
          trend: data.transactions_trend,
          label: 'Transactions',
          color: 'purple',
          current: data.transactions,
          change: data.transactions_change,
          isPrice: false
        };
      case 'transfers':
        return {
          trend: data.transfers_trend,
          label: 'Transfers',
          color: 'orange',
          current: data.transfers,
          change: data.transfers_change,
          isPrice: false
        };
      case 'price_ceiling':
        return {
          trend: data.price_ceiling_trend,
          label: 'Price Ceiling',
          color: 'red',
          current: data.price_ceiling_trend[0],
          change: (data.price_ceiling_trend[0] - data.price_ceiling_trend[23]) / data.price_ceiling_trend[23],
          isPrice: true
        };
      default:
        return {
          trend: data.volume_trend,
          label: 'Volume',
          color: 'blue',
          current: data.volume,
          change: data.volume_change,
          isPrice: true
        };
    }
  };

  const renderTrendChart = (trendData, label, color, isPrice) => {
    if (!Array.isArray(trendData) || trendData.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          No trend data available
        </div>
      );
    }

    const dataPoints = timeRange === '12h' ? trendData.slice(0, 12) : trendData;
    const dates = timeRange === '12h' ? data.block_dates.slice(0, 12) : data.block_dates;
    const maxValue = Math.max(...dataPoints.filter(v => v !== 0));

    return (
      <div className="h-64 relative">
        <div className="flex justify-between h-full">
          {dataPoints.map((value, index) => (
            <div
              key={index}
              className="relative flex-1 mx-1"
              title={`${formatNumber(value, isPrice)} ${label} at ${dates[index]}`}
            >
              {chartType === 'bar' ? (
                <div
                  className={`absolute bottom-0 w-full bg-${color}-500 opacity-75 rounded-t transition-all duration-300`}
                  style={{
                    height: `${maxValue > 0 ? ((value || 0) / maxValue) * 100 : 0}%`
                  }}
                ></div>
              ) : (
                <div
                  className={`absolute w-3 h-3 rounded-full bg-${color}-500 transition-all duration-300`}
                  style={{
                    bottom: `${maxValue > 0 ? ((value || 0) / maxValue) * 100 : 0}%`,
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                ></div>
              )}
            </div>
          ))}
          {chartType === 'line' && dataPoints.map((value, index) => {
            if (index === dataPoints.length - 1) return null;
            const currentHeight = maxValue > 0 ? ((value || 0) / maxValue) * 100 : 0;
            const nextHeight = maxValue > 0 ? ((dataPoints[index + 1] || 0) / maxValue) * 100 : 0;
            return (
              <div
                key={`line-${index}`}
                className={`absolute h-px bg-${color}-500 opacity-50 transition-all duration-300`}
                style={{
                  bottom: `${currentHeight}%`,
                  left: `${(index / dataPoints.length) * 100}%`,
                  width: `${100 / dataPoints.length}%`,
                  transform: `rotate(${Math.atan2(nextHeight - currentHeight, 100 / dataPoints.length)}rad)`,
                  transformOrigin: 'left bottom'
                }}
              ></div>
            );
          })}
        </div>
        <div className="absolute bottom-0 w-full h-px bg-gray-300"></div>
      </div>
    );
  };

  const metricData = getMetricData();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text gradient-blue mb-4">
            NFT Market Analytics
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Track key market metrics and trends
          </p>
        </div>

        {/* Controls */}
        <div className={`card glass-effect p-4 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Metric:</label>
              <select
                className={`rounded-lg px-3 py-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="volume">Trading Volume</option>
                <option value="sales">Sales</option>
                <option value="transactions">Transactions</option>
                <option value="transfers">Transfers</option>
                <option value="price_ceiling">Price Ceiling</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Time Range:</label>
              <select
                className={`rounded-lg px-3 py-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="24h">24 Hours</option>
                <option value="12h">12 Hours</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Chart Type:</label>
              <select
                className={`rounded-lg px-3 py-1 ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Trading Volume</h3>
            <p className="text-3xl font-bold gradient-text gradient-blue">
              {formatNumber(data.volume, true)}
            </p>
            <p className={`text-sm mt-2 ${data.volume_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.volume_change)} change
            </p>
          </div>

          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
            <p className="text-3xl font-bold gradient-text gradient-green">
              {formatNumber(data.sales)}
            </p>
            <p className={`text-sm mt-2 ${data.sales_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.sales_change)} change
            </p>
          </div>

          <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
            <h3 className="text-lg font-semibold mb-2">Transactions</h3>
            <p className="text-3xl font-bold gradient-text gradient-purple">
              {formatNumber(data.transactions)}
            </p>
            <p className={`text-sm mt-2 ${data.transactions_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.transactions_change)} change
            </p>
          </div>
        </div>

        {/* Market Status */}
        <div className={`card glass-effect p-6 mb-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <h2 className="text-2xl font-bold mb-6">Market Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Blockchain</h3>
              <p className="text-2xl font-bold capitalize">
                {data.blockchain || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Network</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Chain ID</h3>
              <p className="text-2xl font-bold">
                {data.chain_id || 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Network identifier</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Last Updated</h3>
              <p className="text-xl font-bold">
                {data.updated_at ? new Date(data.updated_at).toLocaleString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Latest data timestamp</p>
            </div>
          </div>
        </div>

        {/* Selected Metric Trend */}
        <div className={`card glass-effect p-6 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {timeRange === '12h' ? '12-Hour' : '24-Hour'} {metricData.label} Trend
            </h2>
            <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm font-medium">
                Current: {formatNumber(metricData.current, metricData.isPrice)}
              </p>
              <p className={`text-xs ${metricData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getPercentageChange(metricData.change)} change
              </p>
            </div>
          </div>
          {renderTrendChart(metricData.trend, metricData.label, metricData.color, metricData.isPrice)}
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>{timeRange === '12h' ? '12 hours ago' : '24 hours ago'}</span>
            <span>Now</span>
          </div>
        </div>

        {/* Additional Stats */}
        <div className={`card glass-effect p-6 mt-8 ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <h2 className="text-2xl font-bold mb-6">Market Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Average Price per Sale</h3>
              <p className="text-3xl font-bold">
                {formatNumber(data.volume / data.sales, true)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                trading volume / total sales
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Transfer Rate</h3>
              <p className="text-3xl font-bold">
                {((data.transfers / data.transactions) * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                transfers per transaction
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMarketAnalyticsReport;