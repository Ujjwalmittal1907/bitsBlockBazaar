import React from 'react';
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
  Scatter
} from 'recharts';

const NFTAdvancedCharts = ({ data }) => {
  const { isDark } = useTheme();
  const textColor = isDark ? '#E5E7EB' : '#1F2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const tooltipStyle = {
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
  };

  // Sample data transformation (replace with actual data)
  const transformedData = data?.holders_trend?.map((value, index) => ({
    timestamp: data.block_dates[index],
    holders: value,
    whales: data.holders_whales_trend[index],
    volume: Math.random() * 1000, // Replace with actual volume data
    price: Math.random() * 10, // Replace with actual price data
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="text-sm font-semibold mb-2">{new Date(label).toLocaleString()}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Market Activity Chart */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <h3 className="text-xl font-bold mb-4">Market Activity</h3>
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
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holder Distribution Chart */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <h3 className="text-xl font-bold mb-4">Holder Distribution Trend</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                stroke={textColor}
              />
              <YAxis stroke={textColor} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="holders"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="whales"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.5}
              />
              <Brush dataKey="timestamp" height={30} stroke={textColor} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default NFTAdvancedCharts;
