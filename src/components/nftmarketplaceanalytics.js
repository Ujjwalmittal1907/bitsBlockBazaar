import React, { useState, useEffect } from 'react';
import ModernLoader from './ModernLoader';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Select from 'react-select';

const NFTMarketAnalyticsReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState('area');

  const timeRangeOptions = [
    { value: '15m', label: 'Last 15 Minutes', description: 'Most recent market insights' },
    { value: '30m', label: 'Last 30 Minutes', description: 'Short-term market trends' },
    { value: '24h', label: 'Last 24 Hours', description: 'Daily market overview' },
    { value: '7d', label: 'Last 7 Days', description: 'Weekly market analysis' },
    { value: '30d', label: 'Last 30 Days', description: 'Monthly market trends' },
    { value: '90d', label: 'Last 90 Days', description: 'Quarterly market view' },
    { value: 'all', label: 'All Time', description: 'Complete market history' }
  ];

  const metricOptions = [
    { value: 'volume', label: 'Volume' },
    { value: 'sales', label: 'Sales' },
    { value: 'transactions', label: 'Transactions' }
  ];

  const getLoadingMessage = () => {
    switch(timeRange) {
      case '15m':
        return 'Analyzing last 15 minutes of market data...';
      case '30m':
        return 'Processing last 30 minutes of market activity...';
      case '24h':
        return 'Gathering 24-hour market performance...';
      case '7d':
        return 'Compiling weekly market statistics...';
      case '30d':
        return 'Analyzing monthly market trends...';
      case '90d':
        return 'Processing quarterly market data...';
      case 'all':
        return 'Retrieving complete market history...';
      default:
        return 'Loading market analytics...';
    }
  };

  const CustomTimeRangeOption = ({ innerProps, label, description, isSelected }) => (
    <div 
      {...innerProps} 
      className={`px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer ${
        isSelected ? 'bg-blue-500 text-white' : ''
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>{description}</div>
    </div>
  );

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      background: '#1f2937',
      borderColor: '#374151',
      minHeight: '42px',
      '&:hover': {
        borderColor: '#4b5563'
      }
    }),
    menu: (base) => ({
      ...base,
      background: '#1f2937',
      border: `1px solid #374151`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      background: isSelected 
        ? '#3b82f6'
        : isFocused 
          ? '#374151'
          : 'transparent',
      color: isSelected 
        ? 'white'
        : 'white',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({
      ...base,
      color: 'white',
      fontSize: '0.95rem'
    }),
    input: (base) => ({
      ...base,
      color: 'white'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      fontSize: '0.95rem'
    })
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-api-key': process.env.REACT_APP_X_API_KEY
        }
      };

      const response = await fetch(
        `https://api.unleashnfts.com/api/v2/nft/market-insights/analytics?time_range=${timeRange}`,
        options
      );
      const result = await response.json();
      if (result?.data?.[0]) {
        setData(result.data[0]);
      } else {
        setError('Invalid data format received');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch market analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const getTimeRangeLabel = () => {
    const option = timeRangeOptions.find(opt => opt.value === timeRange);
    return option ? option.label : 'Last 24 Hours';
  };

  const formatAxisDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    switch (timeRange) {
      case '15m':
      case '30m':
      case '24h':
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'UTC'
        });
      case '7d':
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC'
        });
      case '30d':
      case '90d':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC'
        });
      case 'all':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC'
        });
      default:
        return date.toLocaleDateString();
    }
  };

  const getMetricData = () => {
    if (!data) return null;
    
    const metrics = {
      volume: {
        trend: data.volume_trend || [],
        label: 'Volume',
        color: '#3B82F6',
        current: data.volume,
        change: data.volume_change,
        isPrice: true,
        description: 'Total trading volume in USD'
      },
      sales: {
        trend: data.sales_trend || [],
        label: 'Sales',
        color: '#10B981',
        current: data.sales,
        change: data.sales_change,
        isPrice: false,
        description: 'Number of NFT sales'
      },
      transactions: {
        trend: data.transactions_trend || [],
        label: 'Transactions',
        color: '#8B5CF6',
        current: data.transactions,
        change: data.transactions_change,
        isPrice: false,
        description: 'Total blockchain transactions'
      }
    };
    return metrics[selectedMetric];
  };

  const getChartData = () => {
    if (!data || !metricData) return [];

    const trend = metricData.trend;
    const dates = data.block_dates;
    
    if (!trend || !dates || trend.length !== dates.length) return [];

    return trend.map((value, index) => ({
      time: formatAxisDate(dates[index]),
      value: value || 0,
      date: dates[index] // Keep original date for tooltip
    })).reverse();
  };

  const metricData = getMetricData();
  const chartData = getChartData();

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
    const percentage = value * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1E293B] p-4 rounded-lg border border-gray-700 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">
            {new Date(data.date).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'UTC'
            })}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold" style={{ color: metricData?.color }}>
              {formatNumber(data.value, metricData?.isPrice)}
            </span>
            {metricData?.label && (
              <span className="text-sm text-gray-400">{metricData.label}</span>
            )}
          </div>
          {metricData?.description && (
            <p className="text-xs text-gray-500 mt-1">{metricData.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const getXAxisConfig = () => {
    const dataLength = chartData.length;
    let interval = 0;

    switch (timeRange) {
      case '15m':
      case '30m':
        interval = Math.ceil(dataLength / 15);
        break;
      case '24h':
        interval = Math.ceil(dataLength / 24); 
        break;
      case '7d':
        interval = Math.ceil(dataLength / 14); 
        break;
      case '30d':
        interval = Math.ceil(dataLength / 30); 
        break;
      case '90d':
        interval = Math.ceil(dataLength / 30);
        break;
      case 'all':
        interval = Math.ceil(dataLength / 24);
        break;
      default:
        interval = Math.ceil(dataLength / 15);
    }

    return {
      stroke: '#64748B',
      tick: { 
        fill: '#94A3B8',
        fontSize: 11
      },
      tickLine: { stroke: '#64748B' },
      dataKey: "time",
      angle: -45,
      textAnchor: "end",
      height: 60,
      interval,
      tickMargin: 25,
      minTickGap: 15,
      scale: 'point',
      padding: { left: 10, right: 10 }
    };
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 10, bottom: 60 }
    };

    const commonAxisProps = {
      stroke: '#64748B',
      tick: { 
        fill: '#94A3B8',
        fontSize: 11
      },
      tickLine: { stroke: '#64748B' }
    };

    const xAxisProps = getXAxisConfig();

    const yAxisProps = {
      ...commonAxisProps,
      tickFormatter: (value) => formatNumber(value, metricData?.isPrice),
      width: 80,
      padding: { top: 20, bottom: 20 },
      grid: {
        stroke: 'rgba(226, 232, 240, 0.1)',
        strokeDasharray: '3 3'
      }
    };

    switch (chartType) {
      case 'area':
        return (
          <div className="h-[600px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart {...commonProps}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricData?.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metricData?.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(226, 232, 240, 0.1)" strokeDasharray="3 3" vertical={false} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={metricData?.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGradient)"
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'line':
        return (
          <div className="h-[600px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart {...commonProps}>
                <CartesianGrid stroke="rgba(226, 232, 240, 0.1)" strokeDasharray="3 3" vertical={false} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={metricData?.color}
                  strokeWidth={2}
                  dot={{ fill: metricData?.color, r: 1 }}
                  activeDot={{ r: 6 }}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'bar':
        return (
          <div className="h-[600px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart {...commonProps}>
                <CartesianGrid stroke="rgba(226, 232, 240, 0.1)" strokeDasharray="3 3" vertical={false} />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill={metricData?.color}
                  animationDuration={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  const getSummaryInsights = () => {
    if (!data) return [];

    const insights = [];
    
    // Volume insights
    const volumeChange = data.volume_change;
    const volumeChangeStr = getPercentageChange(volumeChange);
    if (volumeChangeStr) {
      insights.push({
        type: volumeChange >= 0 ? 'success' : 'warning',
        text: `Trading volume has ${volumeChange >= 0 ? 'increased' : 'decreased'} by ${volumeChangeStr.replace('+', '')} ${timeRange === '24h' ? 'in the last 24 hours' : `over the selected period`}`
      });
    }

    // Sales insights
    const salesChange = data.sales_change;
    const salesChangeStr = getPercentageChange(salesChange);
    if (salesChangeStr) {
      insights.push({
        type: salesChange >= 0 ? 'success' : 'warning',
        text: `NFT sales have ${salesChange >= 0 ? 'increased' : 'decreased'} by ${salesChangeStr.replace('+', '')}`
      });
    }

    // Transactions insights
    const txChange = data.transactions_change;
    const txChangeStr = getPercentageChange(txChange);
    if (txChangeStr) {
      insights.push({
        type: txChange >= 0 ? 'success' : 'warning',
        text: `Transaction volume has ${txChange >= 0 ? 'increased' : 'decreased'} by ${txChangeStr.replace('+', '')}`
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <ModernLoader text={getLoadingMessage()} />
        <p className="text-gray-400 animate-pulse">
          {timeRange === '15m' || timeRange === '30m' 
            ? 'Processing real-time market data...'
            : timeRange === '7d' || timeRange === '30d' || timeRange === '90d'
              ? 'Analyzing historical market trends...'
              : 'Fetching market insights...'}
        </p>
      </div>
    );
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
      <div className="text-center text-gray-500 p-4">
        No market analytics available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Summary Insights */}
        <div className="bg-[#1E293B] rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Market Summary</h3>
          <div className="space-y-3">
            {getSummaryInsights().map((insight, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 text-sm ${
                  insight.type === 'success' ? 'text-green-400' :
                  insight.type === 'warning' ? 'text-amber-400' :
                  'text-blue-400'
                }`}
              >
                <span className="mt-1">
                  {insight.type === 'success' ? '↗' :
                   insight.type === 'warning' ? '↘' : 'ℹ'}
                </span>
                <span>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">NFT Analytics</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2 rounded-lg transition-all duration-200 ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Volume</div>
            <div className="text-xl font-semibold">
              {formatNumber(data?.volume, true)}
            </div>
            <div className={`text-sm ${data?.volume_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {getPercentageChange(data?.volume_change)}
            </div>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Sales</div>
            <div className="text-xl font-semibold">
              {formatNumber(data?.sales)}
            </div>
            <div className={`text-sm ${data?.sales_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {getPercentageChange(data?.sales_change)}
            </div>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Transactions</div>
            <div className="text-xl font-semibold">
              {formatNumber(data?.transactions)}
            </div>
            <div className={`text-sm ${data?.transactions_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {getPercentageChange(data?.transactions_change)}
            </div>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Transfers</div>
            <div className="text-xl font-semibold">
              {formatNumber(data?.transfers)}
            </div>
            <div className={`text-sm ${data?.transfers_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {getPercentageChange(data?.transfers_change)}
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="bg-[#1E293B] rounded-lg p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setChartType('area')}
                  className={`p-2 rounded ${
                    chartType === 'area'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`p-2 rounded ${
                    chartType === 'line'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-2 rounded ${
                    chartType === 'bar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Bar
                </button>
              </div>

              <Select
                className="min-w-[200px] z-10"
                options={metricOptions}
                value={{ 
                  value: selectedMetric, 
                  label: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1).replace('_', ' ') 
                }}
                onChange={(option) => setSelectedMetric(option.value)}
                styles={{
                  control: (base) => ({
                    ...base,
                    background: '#1E293B',
                    borderColor: '#374151',
                    '&:hover': {
                      borderColor: '#4B5563'
                    }
                  }),
                  menu: (base) => ({
                    ...base,
                    background: '#1E293B',
                    border: '1px solid #374151'
                  }),
                  option: (base, { isFocused, isSelected }) => ({
                    ...base,
                    backgroundColor: isSelected
                      ? '#3B82F6'
                      : isFocused
                      ? '#2563EB'
                      : '#1E293B',
                    color: 'white',
                    ':active': {
                      backgroundColor: '#2563EB'
                    }
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: 'white'
                  })
                }}
              />
            </div>

            <Select
              className="min-w-[200px] z-10"
              options={timeRangeOptions}
              value={timeRangeOptions.find((option) => option.value === timeRange)}
              onChange={(option) => setTimeRange(option.value)}
              styles={{
                control: (base) => ({
                  ...base,
                  background: '#1E293B',
                  borderColor: '#374151',
                  '&:hover': {
                    borderColor: '#4B5563'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  background: '#1E293B',
                  border: '1px solid #374151'
                }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected
                    ? '#3B82F6'
                    : isFocused
                    ? '#2563EB'
                    : '#1E293B',
                  color: 'white',
                  ':active': {
                    backgroundColor: '#2563EB'
                  }
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'white'
                })
              }}
            />
          </div>
          
          {/* Chart Container */}
          <div className="h-[600px] w-full bg-[#1E293B] rounded-lg overflow-hidden">
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMarketAnalyticsReport;