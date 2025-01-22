import React, { useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ComposedChart,
  Bar,
  Line,
  Scatter,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F'];

const NFTAnalyticsDashboard = ({ data }) => {
  const { isDark } = useTheme();
  const [activeTimeRange, setActiveTimeRange] = useState('1M'); // 1D, 1W, 1M, 3M, 1Y
  const [selectedMetric, setSelectedMetric] = useState('holders');
  const textColor = isDark ? '#E5E7EB' : '#1F2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Transform data for different visualizations
  const transformedData = data?.holders_trend?.map((value, index) => ({
    timestamp: data.block_dates[index],
    holders: value,
    whales: data.holders_whales_trend[index],
    volume: Math.random() * 1000, // Replace with actual volume data
    price: Math.random() * 10, // Replace with actual price data
    uniqueWallets: Math.floor(Math.random() * value), // Replace with actual data
  })) || [];

  // Distribution data for pie chart
  const distributionData = [
    { name: 'Regular Holders', value: data?.holders - (data?.holders_whales || 0) || 0 },
    { name: 'Whale Holders', value: data?.holders_whales || 0 },
  ];

  // Metrics data for radar chart
  const metricsData = [
    { subject: 'Holders', A: data?.holders || 0, fullMark: 100 },
    { subject: 'Whales', A: data?.holders_whales || 0, fullMark: 100 },
    { subject: 'Volume', A: Math.random() * 100, fullMark: 100 }, // Replace with actual data
    { subject: 'Liquidity', A: Math.random() * 100, fullMark: 100 }, // Replace with actual data
    { subject: 'Activity', A: Math.random() * 100, fullMark: 100 }, // Replace with actual data
  ];

  // Market segments for treemap
  const marketData = [
    { name: 'Retail Holders', size: data?.holders - (data?.holders_whales || 0) || 0 },
    { name: 'Whale Holders', size: data?.holders_whales || 0 },
    { name: 'Active Traders', size: Math.random() * 1000 }, // Replace with actual data
    { name: 'New Wallets', size: Math.random() * 500 }, // Replace with actual data
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="text-sm font-semibold mb-2">
          {label ? new Date(label).toLocaleString() : 'N/A'}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  };

  const handleTimeRangeChange = useCallback((range) => {
    setActiveTimeRange(range);
    // Implement time range filtering logic here
  }, []);

  const handleMetricChange = useCallback((metric) => {
    setSelectedMetric(metric);
    // Implement metric switching logic here
  }, []);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Time Range:</span>
          {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-3 py-1 rounded-md text-sm ${
                activeTimeRange === range
                  ? 'bg-indigo-600 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Metric:</span>
          {['holders', 'whales', 'volume', 'price'].map((metric) => (
            <button
              key={metric}
              onClick={() => handleMetricChange(metric)}
              className={`px-3 py-1 rounded-md text-sm capitalize ${
                selectedMetric === metric
                  ? 'bg-indigo-600 text-white'
                  : isDark
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <h3 className="text-xl font-bold mb-4">Market Overview</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                stroke={textColor}
              />
              <YAxis yAxisId="left" stroke={textColor} />
              <YAxis yAxisId="right" orientation="right" stroke={textColor} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="volume" fill="#8884d8" opacity={0.5} />
              <Line yAxisId="right" type="monotone" dataKey="price" stroke="#82ca9d" />
              <Scatter yAxisId="right" dataKey="whales" fill="#ff7300" />
              <Brush dataKey="timestamp" height={30} stroke={textColor} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Holder Distribution */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <h3 className="text-xl font-bold mb-4">Holder Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Metrics */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
          <h3 className="text-xl font-bold mb-4">Market Metrics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metricsData}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="subject" stroke={textColor} />
                <PolarRadiusAxis stroke={textColor} />
                <Radar
                  name="Metrics"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Market Segments Treemap */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <h3 className="text-xl font-bold mb-4">Market Segments</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={marketData}
              dataKey="size"
              stroke="#fff"
              fill="#8884d8"
              content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill: COLORS[index % COLORS.length],
                      stroke: '#fff',
                      strokeWidth: 2 / (depth + 1e-10),
                      strokeOpacity: 1 / (depth + 1e-10),
                    }}
                  />
                  {depth === 1 && (
                    <text
                      x={x + width / 2}
                      y={y + height / 2 + 7}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={14}
                    >
                      {name}
                    </text>
                  )}
                </g>
              )}
            />
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default NFTAnalyticsDashboard;
