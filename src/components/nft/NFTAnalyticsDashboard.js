import React, { useState, useCallback, useMemo } from 'react';
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
  const [activeTimeRange, setActiveTimeRange] = useState('1M');
  const [selectedMetric, setSelectedMetric] = useState('holders');
  const [aggregationType, setAggregationType] = useState('sum'); // 'sum', 'average', 'median'
  const [showOutliers, setShowOutliers] = useState(false);
  const [smoothingFactor, setSmoothingFactor] = useState(1); // 1-5
  const [confidenceInterval, setConfidenceInterval] = useState(0.95); // 95% confidence
  const textColor = isDark ? '#E5E7EB' : '#1F2937';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Enhanced data transformation with statistical analysis
  const transformedData = useMemo(() => {
    if (!data?.holders_trend) return [];

    return data.block_dates.map((date, index) => {
      const baseData = {
        timestamp: date,
        holders: data.holders_trend[index],
        whales: data.holders_whales_trend[index],
        volume: data.volume_trend?.[index] || 0,
        price: data.price_trend?.[index] || 0,
        uniqueWallets: data.unique_wallets_trend?.[index] || 0,
      };

      // Calculate moving averages
      const movingAverageWindow = 5;
      if (index >= movingAverageWindow - 1) {
        const recentData = data.holders_trend.slice(index - movingAverageWindow + 1, index + 1);
        baseData.movingAverage = recentData.reduce((sum, val) => sum + val, 0) / movingAverageWindow;
      }

      // Calculate volatility
      if (index > 0) {
        const previousValue = data.holders_trend[index - 1];
        baseData.volatility = ((baseData.holders - previousValue) / previousValue) * 100;
      }

      // Add momentum indicators
      if (index >= 14) {
        const rsiPeriod = 14;
        const gains = [];
        const losses = [];
        for (let i = index - rsiPeriod + 1; i <= index; i++) {
          const change = data.holders_trend[i] - data.holders_trend[i - 1];
          if (change >= 0) gains.push(change);
          else losses.push(Math.abs(change));
        }
        const avgGain = gains.reduce((sum, val) => sum + val, 0) / rsiPeriod;
        const avgLoss = losses.reduce((sum, val) => sum + val, 0) / rsiPeriod;
        baseData.rsi = 100 - (100 / (1 + (avgGain / (avgLoss || 1))));
      }

      return baseData;
    });
  }, [data]);

  // Calculate statistical metrics
  const statistics = useMemo(() => {
    if (!transformedData.length) return null;

    const values = transformedData.map(d => d[selectedMetric]).filter(Boolean);
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    // Calculate outliers using IQR method
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const outliers = values.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);

    return {
      mean,
      median,
      stdDev,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      q1,
      q3,
      outliers
    };
  }, [transformedData, selectedMetric]);

  // Distribution data with enhanced segmentation
  const distributionData = useMemo(() => {
    if (!data) return [];

    const totalHolders = data.holders || 0;
    const whales = data.holders_whales || 0;
    const mediumHolders = Math.floor((totalHolders - whales) * 0.3);
    const smallHolders = totalHolders - whales - mediumHolders;

    return [
      { name: 'Small Holders', value: smallHolders, category: 'retail' },
      { name: 'Medium Holders', value: mediumHolders, category: 'institutional' },
      { name: 'Whale Holders', value: whales, category: 'whale' }
    ];
  }, [data]);

  // Enhanced trend analysis
  const trendAnalysis = useMemo(() => {
    if (!transformedData.length) return null;

    const recentData = transformedData.slice(-30); // Last 30 data points
    const values = recentData.map(d => d[selectedMetric]);
    
    // Calculate trend direction
    const trendLine = values.map((v, i) => ({
      x: i,
      y: v
    }));
    
    const n = trendLine.length;
    const sumX = trendLine.reduce((sum, p) => sum + p.x, 0);
    const sumY = trendLine.reduce((sum, p) => sum + p.y, 0);
    const sumXY = trendLine.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = trendLine.reduce((sum, p) => sum + p.x * p.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return {
      direction: slope > 0 ? 'upward' : slope < 0 ? 'downward' : 'sideways',
      strength: Math.abs(slope),
      predictedNext: intercept + slope * n
    };
  }, [transformedData, selectedMetric]);

  // Chart configurations with enhanced customization
  const chartConfig = {
    margin: { top: 10, right: 30, left: 0, bottom: 0 },
    style: {
      background: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: '8px',
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border border-gray-200 shadow-lg`}>
        <p className="font-semibold">{new Date(label).toLocaleDateString()}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
        {statistics && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Mean: {statistics.mean.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              StdDev: {statistics.stdDev.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
        >
          <option value="holders">Holders</option>
          <option value="whales">Whales</option>
          <option value="volume">Volume</option>
          <option value="price">Price</option>
        </select>

        <select
          value={aggregationType}
          onChange={(e) => setAggregationType(e.target.value)}
          className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
        >
          <option value="sum">Sum</option>
          <option value="average">Average</option>
          <option value="median">Median</option>
        </select>

        <div className="flex items-center space-x-2">
          <label>Smoothing:</label>
          <input
            type="range"
            min="1"
            max="5"
            value={smoothingFactor}
            onChange={(e) => setSmoothingFactor(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showOutliers}
            onChange={(e) => setShowOutliers(e.target.checked)}
          />
          <span>Show Outliers</span>
        </label>
      </div>

      {/* Main Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={transformedData} {...chartConfig}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="timestamp"
              stroke={textColor}
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
            />
            <YAxis stroke={textColor} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              fill={COLORS[0]}
              stroke={COLORS[0]}
              fillOpacity={0.3}
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke={COLORS[1]}
              dot={false}
              strokeDasharray="5 5"
            />
            {showOutliers && statistics?.outliers.length > 0 && (
              <Scatter
                data={transformedData.filter(d => 
                  statistics.outliers.includes(d[selectedMetric])
                )}
                fill={COLORS[2]}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Analysis */}
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
          {trendAnalysis && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Direction:</span>
                <span className={`font-semibold ${
                  trendAnalysis.direction === 'upward' ? 'text-green-500' :
                  trendAnalysis.direction === 'downward' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {trendAnalysis.direction.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Strength:</span>
                <span>{(trendAnalysis.strength * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Predicted Next:</span>
                <span>{Math.round(trendAnalysis.predictedNext).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Summary */}
      {statistics && (
        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h3 className="text-lg font-semibold mb-4">Statistical Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="block text-sm text-gray-500">Mean</span>
              <span className="text-lg font-semibold">{statistics.mean.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Median</span>
              <span className="text-lg font-semibold">{statistics.median.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Standard Deviation</span>
              <span className="text-lg font-semibold">{statistics.stdDev.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">Outliers</span>
              <span className="text-lg font-semibold">{statistics.outliers.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTAnalyticsDashboard;
