import React, { useState, useEffect } from 'react';
import { NFTInsightsAPI } from '../../api/nftInsightsEndpoints';
import { useTheme } from '../../context/ThemeContext';
import ModernLoader from '../ModernLoader';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import BackButton from '../../components/BackButton';
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

const NFTMarketAnalyticsReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [chartType, setChartType] = useState('line');
  const [selectedMetric, setSelectedMetric] = useState('volume');
  const { isDark } = useTheme();

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const metrics = [
    { value: 'volume', label: 'Trading Volume' },
    { value: 'sales', label: 'Number of Sales' },
    { value: 'avgPrice', label: 'Average Price' },
    { value: 'marketCap', label: 'Market Cap' },
    { value: 'uniqueTraders', label: 'Unique Traders' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [marketAnalytics, marketScores] = await Promise.all([
          NFTInsightsAPI.getMarketAnalytics({
            timeRange,
            metrics: [selectedMetric],
            aggregation: 'hourly'
          }),
          NFTInsightsAPI.getMarketScores({ timeRange })
        ]);
        
        if (marketAnalytics?.data && marketScores?.data) {
          setData({
            analytics: marketAnalytics.data,
            scores: marketScores.data
          });
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
  }, [timeRange, selectedMetric]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#fff' : '#000'
        }
      },
      title: {
        display: true,
        text: `NFT Market ${metrics.find(m => m.value === selectedMetric)?.label || ''} Analysis`,
        color: isDark ? '#fff' : '#000'
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? '#fff' : '#000'
        }
      },
      y: {
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

  const renderChart = () => {
    if (!data?.analytics?.timeline) return null;

    const chartData = {
      labels: data.analytics.timeline.map(item => new Date(item.timestamp).toLocaleString()),
      datasets: [
        {
          label: metrics.find(m => m.value === selectedMetric)?.label,
          data: data.analytics.timeline.map(item => item[selectedMetric]),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: chartType === 'line' 
            ? 'rgba(99, 102, 241, 0.2)'
            : 'rgb(99, 102, 241)',
          fill: chartType === 'line',
          tension: 0.4
        }
      ]
    };

    return chartType === 'line' 
      ? <Line options={chartOptions} data={chartData} height={400} />
      : <Bar options={chartOptions} data={chartData} height={400} />;
  };

  if (loading) {
    return <ModernLoader text="Loading Market Analytics..." />;
  }

  if (error) {
    return (
      <div className={`text-center p-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <BackButton />
      <div className="flex flex-col items-center justify-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">NFT Market Analytics</h1>
          <p className="text-gray-500">
            Powered by bitsCrunch APIs - Comprehensive market analysis and insights
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

          {/* Chart Type Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Grid */}
        {data?.analytics?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Object.entries(data.analytics.metrics).map(([key, value]) => (
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
                {data.analytics.changes?.[`${key}_change`] && (
                  <div className={`flex items-center text-sm mt-2 ${
                    data.analytics.changes[`${key}_change`] >= 0 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {data.analytics.changes[`${key}_change`] >= 0 ? '↑' : '↓'}
                    {Math.abs(data.analytics.changes[`${key}_change`]).toFixed(2)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Main Metric Chart */}
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">Trend Analysis</h2>
            <div className="h-[400px]">
              {renderChart()}
            </div>
          </div>

          {/* Market Distribution */}
          {data?.analytics?.distribution && (
            <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Market Distribution</h2>
              <div className="h-[400px]">
                <Doughnut
                  options={doughnutOptions}
                  data={{
                    labels: Object.keys(data.analytics.distribution),
                    datasets: [{
                      data: Object.values(data.analytics.distribution),
                      backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                      ]
                    }]
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Market Health Score */}
        {data?.scores && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}>
            <h2 className="text-xl font-semibold mb-4">Market Health Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Overall Health Score</h3>
                <div className={`text-4xl font-bold ${
                  data.scores.health_score >= 7 ? 'text-green-500' :
                  data.scores.health_score >= 5 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {data.scores.health_score.toFixed(1)}/10
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Market Sentiment</h3>
                <div className={`text-xl font-medium ${
                  data.scores.sentiment === 'positive' ? 'text-green-500' :
                  data.scores.sentiment === 'neutral' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {data.scores.sentiment.charAt(0).toUpperCase() + data.scores.sentiment.slice(1)}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Risk Level</h3>
                <div className={`text-xl font-medium ${
                  data.scores.risk_level === 'low' ? 'text-green-500' :
                  data.scores.risk_level === 'medium' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {data.scores.risk_level.charAt(0).toUpperCase() + data.scores.risk_level.slice(1)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights and Recommendations */}
        {data?.analytics?.insights && (
          <div className={`rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Market Insights</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.analytics.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      isDark ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <h3 className="font-medium mb-2">{insight.title}</h3>
                    <p className="text-sm text-gray-500">{insight.description}</p>
                    {insight.impact && (
                      <div className={`mt-2 px-2 py-1 rounded text-sm inline-block ${
                        insight.impact === 'positive' ? 'bg-green-500/20 text-green-500' :
                        insight.impact === 'neutral' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        Impact: {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMarketAnalyticsReport;