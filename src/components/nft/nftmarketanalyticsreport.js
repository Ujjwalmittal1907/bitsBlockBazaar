import React, { useState, useEffect } from 'react';
import ModernLoader from '../ModernLoader';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

  useEffect(() => {
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

    fetchData();
  }, [timeRange]);

  const getTimeRangeLabel = () => {
    const option = timeRangeOptions.find(opt => opt.value === timeRange);
    return option ? option.label : 'Last 24 Hours';
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

  const getMetricData = () => {
    const metrics = {
      volume: {
        trend: data.volume_trend,
        label: 'Volume',
        color: '#3B82F6',
        current: data.volume,
        change: data.volume_change,
        isPrice: true
      },
      sales: {
        trend: data.sales_trend,
        label: 'Sales',
        color: '#10B981',
        current: data.sales,
        change: data.sales_change,
        isPrice: false
      },
      transactions: {
        trend: data.transactions_trend,
        label: 'Transactions',
        color: '#8B5CF6',
        current: data.transactions,
        change: data.transactions_change,
        isPrice: false
      },
      transfers: {
        trend: data.transfers_trend,
        label: 'Transfers',
        color: '#F59E0B',
        current: data.transfers,
        change: data.transfers_change,
        isPrice: false
      }
    };
    return metrics[selectedMetric];
  };

  const metricData = getMetricData();
  const chartData = metricData.trend.map((value, index) => ({
    time: new Date(data.block_dates[index]).toLocaleTimeString(),
    value: value
  }));

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E293B] p-3 rounded-lg border border-gray-700">
          <p className="text-gray-400">{label}</p>
          <p className="font-semibold" style={{ color: metricData.color }}>
            {formatNumber(payload[0].value, metricData.isPrice)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const commonAxisProps = {
      stroke: '#64748B',
      tick: { fill: '#64748B' },
      tickLine: { stroke: '#64748B' }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricData.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={metricData.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" {...commonAxisProps} />
            <YAxis 
              {...commonAxisProps}
              tickFormatter={(value) => formatNumber(value, metricData.isPrice)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metricData.color}
              fillOpacity={1}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey="time" {...commonAxisProps} />
            <YAxis 
              {...commonAxisProps}
              tickFormatter={(value) => formatNumber(value, metricData.isPrice)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={metricData.color}
              strokeWidth={2}
              dot={{ fill: metricData.color }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey="time" {...commonAxisProps} />
            <YAxis 
              {...commonAxisProps}
              tickFormatter={(value) => formatNumber(value, metricData.isPrice)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={metricData.color} />
          </BarChart>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">NFT Analytics</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-[#1E293B] px-4 py-2 rounded-lg text-sm hover:bg-[#2D3748] transition-colors">
              Refresh
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trading Volume */}
          <div className="bg-[#1E293B] rounded-lg p-6">
            <h3 className="text-gray-400 mb-2">Trading Volume</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-blue-500">
                {formatNumber(data.volume, true)}
              </span>
              <span className={`text-sm ${data.volume_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getPercentageChange(data.volume_change)} change
              </span>
            </div>
          </div>

          {/* Total Sales */}
          <div className="bg-[#1E293B] rounded-lg p-6">
            <h3 className="text-gray-400 mb-2">Total Sales</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-green-500">
                {formatNumber(data.sales)}
              </span>
              <span className={`text-sm ${data.sales_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getPercentageChange(data.sales_change)} change
              </span>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-[#1E293B] rounded-lg p-6">
            <h3 className="text-gray-400 mb-2">Transactions</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-purple-500">
                {formatNumber(data.transactions)}
              </span>
              <span className={`text-sm ${data.transactions_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getPercentageChange(data.transactions_change)} change
              </span>
            </div>
          </div>
        </div>

        {/* Chart Controls and Chart */}
        <div className="bg-[#1E293B] rounded-lg p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <Select
              className="min-w-[200px] z-10"
              options={timeRangeOptions}
              value={timeRangeOptions.find(option => option.value === timeRange)}
              onChange={(selected) => setTimeRange(selected.value)}
              placeholder={loading ? "Loading..." : "Select time range..."}
              isDisabled={loading}
              components={{ 
                Option: ({ innerProps, label, data, isSelected }) => (
                  <CustomTimeRangeOption 
                    innerProps={innerProps}
                    label={data.label}
                    description={data.description}
                    isSelected={isSelected}
                  />
                )
              }}
              styles={customSelectStyles}
            />

            <Select
              className="min-w-[200px] z-10"
              options={[
                { value: 'volume', label: 'Volume', description: 'Trading volume in ETH' },
                { value: 'sales', label: 'Sales', description: 'Number of NFT sales' },
                { value: 'average_price', label: 'Average Price', description: 'Average sale price' },
                { value: 'floor_price', label: 'Floor Price', description: 'Minimum listing price' }
              ]}
              value={{ 
                value: selectedMetric, 
                label: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1).replace('_', ' ') 
              }}
              onChange={(selected) => setSelectedMetric(selected.value)}
              placeholder={loading ? "Loading..." : "Select metric..."}
              isDisabled={loading}
              components={{ 
                Option: ({ innerProps, label, data, isSelected }) => (
                  <CustomTimeRangeOption 
                    innerProps={innerProps}
                    label={data.label}
                    description={data.description}
                    isSelected={isSelected}
                  />
                )
              }}
              styles={customSelectStyles}
            />

            <Select
              className="min-w-[200px] z-10"
              options={[
                { value: 'area', label: 'Area Chart', description: 'Visualize trends with filled areas' },
                { value: 'line', label: 'Line Chart', description: 'Clear view of trend lines' },
                { value: 'bar', label: 'Bar Chart', description: 'Compare values with bars' }
              ]}
              value={{ 
                value: chartType,
                label: chartType.charAt(0).toUpperCase() + chartType.slice(1) + ' Chart'
              }}
              onChange={(selected) => setChartType(selected.value)}
              placeholder={loading ? "Loading..." : "Select chart type..."}
              isDisabled={loading}
              components={{ 
                Option: ({ innerProps, label, data, isSelected }) => (
                  <CustomTimeRangeOption 
                    innerProps={innerProps}
                    label={data.label}
                    description={data.description}
                    isSelected={isSelected}
                  />
                )
              }}
              styles={customSelectStyles}
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{getTimeRangeLabel()} {metricData.label} Trend</h2>
            <div className="bg-[#2D3748] px-3 py-1 rounded-lg">
              <p className="text-sm">Current: {formatNumber(metricData.current, metricData.isPrice)}</p>
              <p className={`text-xs ${metricData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getPercentageChange(metricData.change)}
              </p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Status */}
        <div className="bg-[#1E293B] rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Market Status</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-gray-400 mb-1">Blockchain</h3>
              <p className="text-lg font-semibold capitalize">{data.blockchain}</p>
              <p className="text-sm text-gray-500">Network</p>
            </div>
            <div>
              <h3 className="text-gray-400 mb-1">Chain ID</h3>
              <p className="text-lg font-semibold">{data.chain_id}</p>
              <p className="text-sm text-gray-500">Network identifier</p>
            </div>
            <div>
              <h3 className="text-gray-400 mb-1">Last Updated</h3>
              <p className="text-lg font-semibold">
                {new Date(data.updated_at).toLocaleString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
              <p className="text-sm text-gray-500">Latest data timestamp</p>
            </div>
          </div>
        </div>

        {/* Market Metrics */}
        <div className="bg-[#1E293B] rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Market Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-400 mb-2">Average Price per Sale</h3>
              <p className="text-2xl font-bold">
                {formatNumber(data.volume / data.sales, true)}
              </p>
              <p className="text-sm text-gray-500">trading volume / total sales</p>
            </div>
            <div>
              <h3 className="text-gray-400 mb-2">Transfer Rate</h3>
              <p className="text-2xl font-bold">
                {((data.transfers / data.transactions) * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500">transfers per transaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMarketAnalyticsReport;