import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NFTInsightsAPI } from '../../api/nftInsightsEndpoints';
import { useTheme } from '../../context/ThemeContext';
import { Line, Gauge } from 'react-chartjs-2';
import ModernLoader from '../ModernLoader';
import BackButton from '../BackButton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { format } from 'date-fns';
import { calculateRSI, calculateMACD, calculateBollingerBands } from '../../utils/technicalIndicators';
import { performCorrelationAnalysis } from '../../utils/statisticalAnalysis';
import { generateAutomatedReport } from '../../utils/reportGenerator';
import { sendNotification } from '../../utils/notifications';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const DEFAULT_INDICATORS = {
  rsi: { enabled: false, period: 14, overbought: 70, oversold: 30 },
  macd: { enabled: false, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  bollingerBands: { enabled: false, period: 20, stdDev: 2 }
};

const DEFAULT_CORRELATION_METRICS = ['price', 'volume', 'marketCap', 'holders'];

const NFTScoresInsights = () => {
  const [data, setData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();

  // Enhanced state management
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonDate, setComparisonDate] = useState(null);
  const [alertThresholds, setAlertThresholds] = useState({
    fearGreed: { min: 20, max: 80 },
    marketState: { min: 30, max: 70 },
    marketCap: { change: 5 },
    volume: { change: 10 },
    holders: { change: 3 }
  });

  const [displayMode, setDisplayMode] = useState('detailed');
  const [chartAnnotations, setChartAnnotations] = useState(true);
  const [showPredictions, setShowPredictions] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
  
  // Technical indicators state
  const [technicalIndicators, setTechnicalIndicators] = useState(DEFAULT_INDICATORS);
  const [selectedCorrelationMetrics, setSelectedCorrelationMetrics] = useState(DEFAULT_CORRELATION_METRICS);
  
  // Advanced analytics state
  const [volatilityWindow, setVolatilityWindow] = useState(14);
  const [confidenceInterval, setConfidenceInterval] = useState(0.95);
  const [outlierDetectionMethod, setOutlierDetectionMethod] = useState('iqr'); // 'iqr', 'zscore', 'mad'
  const [smoothingFactor, setSmoothingFactor] = useState(0.1);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: { enabled: false, frequency: 'daily' },
    browser: { enabled: true, frequency: 'realtime' },
    telegram: { enabled: false, chatId: '' }
  });

  // Report settings
  const [reportSettings, setReportSettings] = useState({
    schedule: 'weekly',
    format: 'pdf',
    sections: ['overview', 'technical', 'correlation', 'predictions']
  });

  // Enhanced data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [currentData, history] = await Promise.all([
          NFTInsightsAPI.getCurrentMetrics(),
          NFTInsightsAPI.getHistoricalData(customDateRange.start, customDateRange.end)
        ]);

        setData(currentData);
        setHistoricalData(history);

        // Process technical indicators
        if (technicalIndicators.rsi.enabled) {
          const rsiData = calculateRSI(history.prices, technicalIndicators.rsi.period);
          checkAlerts('RSI', rsiData[rsiData.length - 1]);
        }

        if (technicalIndicators.macd.enabled) {
          const macdData = calculateMACD(
            history.prices,
            technicalIndicators.macd.fastPeriod,
            technicalIndicators.macd.slowPeriod,
            technicalIndicators.macd.signalPeriod
          );
          checkAlerts('MACD', macdData[macdData.length - 1]);
        }

        if (technicalIndicators.bollingerBands.enabled) {
          const bbands = calculateBollingerBands(
            history.prices,
            technicalIndicators.bollingerBands.period,
            technicalIndicators.bollingerBands.stdDev
          );
          checkAlerts('BollingerBands', bbands[bbands.length - 1]);
        }

      } catch (err) {
        console.error(err);
        setError('Failed to fetch NFT insights data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customDateRange, technicalIndicators]);

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!historicalData.length) return null;

    // Apply smoothing if needed
    const smoothedData = smoothingFactor > 0 
      ? applyExponentialSmoothing(historicalData, smoothingFactor)
      : historicalData;

    // Calculate volatility
    const volatility = calculateVolatility(smoothedData, volatilityWindow);

    // Detect outliers
    const outliers = detectOutliers(smoothedData, outlierDetectionMethod);

    // Calculate correlation matrix if needed
    const correlations = selectedCorrelationMetrics.length > 1
      ? performCorrelationAnalysis(smoothedData, selectedCorrelationMetrics)
      : null;

    return {
      smoothedData,
      volatility,
      outliers,
      correlations
    };
  }, [historicalData, smoothingFactor, volatilityWindow, outlierDetectionMethod, selectedCorrelationMetrics]);

  // Alert handling
  const checkAlerts = useCallback(async (metric, value) => {
    const threshold = alertThresholds[metric.toLowerCase()];
    if (!threshold) return;

    const isAlert = value < threshold.min || value > threshold.max;
    if (!isAlert) return;

    const message = `${metric} Alert: Current value ${value} is outside threshold range (${threshold.min}-${threshold.max})`;
    
    // Send notifications based on settings
    if (notificationSettings.email.enabled) {
      await sendNotification('email', message);
    }
    if (notificationSettings.browser.enabled) {
      await sendNotification('browser', message);
    }
    if (notificationSettings.telegram.enabled) {
      await sendNotification('telegram', message, notificationSettings.telegram.chatId);
    }
  }, [alertThresholds, notificationSettings]);

  // Report generation
  const generateReport = useCallback(async () => {
    if (!processedData) return;

    const reportData = {
      metrics: data,
      historical: historicalData,
      analysis: processedData,
      indicators: technicalIndicators,
      correlations: processedData.correlations,
      timestamp: new Date().toISOString()
    };

    await generateAutomatedReport(reportData, reportSettings);
  }, [data, historicalData, processedData, technicalIndicators, reportSettings]);

  // Chart configuration
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#E5E7EB' : '#1F2937'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      },
      annotation: chartAnnotations ? {
        annotations: {
          // Add custom annotations based on technical indicators
          ...processedData?.outliers.map((outlier, index) => ({
            type: 'point',
            pointStyle: 'circle',
            radius: 8,
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            xValue: outlier.timestamp,
            yValue: outlier.value
          }))
        }
      } : {}
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? '#E5E7EB' : '#1F2937'
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDark ? '#E5E7EB' : '#1F2937'
        }
      }
    }
  }), [isDark, chartAnnotations, processedData]);

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

  const fearGreedChartData = {
    labels: data.block_dates.map(date => {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'Fear & Greed Index',
        data: data.nft_market_fear_and_greed_index_trend,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const marketStateChartData = {
    labels: data.block_dates.map(date => {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'Market State',
        data: data.marketstate_trend,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto p-4">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">NFT Market Scores</h1>
          <p className="text-gray-500">
            Comprehensive analysis of market sentiment and valuation metrics
          </p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Fear & Greed Index */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Fear & Greed Index</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-500">
                  {data.nft_market_fear_and_greed_index.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {getFearGreedLabel(data.nft_market_fear_and_greed_index)}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                data.nft_market_fear_and_greed_index >= 75 ? 'bg-red-500' :
                data.nft_market_fear_and_greed_index >= 60 ? 'bg-yellow-500' :
                data.nft_market_fear_and_greed_index >= 45 ? 'bg-blue-500' :
                data.nft_market_fear_and_greed_index >= 25 ? 'bg-orange-500' :
                'bg-red-700'
              }`}>
                <span className="text-white text-sm font-bold">
                  {Math.round(data.nft_market_fear_and_greed_index)}
                </span>
              </div>
            </div>
          </div>

          {/* Market State */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Market State</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-500">
                  {data.marketstate}
                </p>
                <p className="text-sm text-gray-500">
                  {getMarketStateLabel(data.marketstate)}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                data.marketstate >= 75 ? 'bg-green-500' :
                data.marketstate >= 60 ? 'bg-green-400' :
                data.marketstate >= 45 ? 'bg-yellow-500' :
                data.marketstate >= 25 ? 'bg-orange-500' :
                'bg-red-500'
              }`}>
                <span className="text-white text-sm font-bold">
                  {Math.round(data.marketstate)}
                </span>
              </div>
            </div>
          </div>

          {/* Market Cap */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-2">Market Cap</h3>
            <p className="text-3xl font-bold text-blue-500">
              {formatCurrency(data.market_cap)}
            </p>
            <p className={`text-sm ${data.market_cap_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {getPercentageChange(data.market_cap_change)} change
            </p>
          </div>
        </div>

        {/* Advanced Options */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Advanced Options</h2>
            <button
              onClick={() => document.getElementById('advancedOptions').classList.toggle('hidden')}
              className="text-blue-500 hover:text-blue-600"
            >
              Toggle Advanced Options
            </button>
          </div>
          
          <div id="advancedOptions" className="hidden space-y-4">
            {/* Display Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">Display Mode</label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
              >
                <option value="detailed">Detailed</option>
                <option value="compact">Compact</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            {/* Comparison Mode */}
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.checked)}
                  className="mr-2"
                />
                Enable Historical Comparison
              </label>
              {comparisonMode && (
                <input
                  type="date"
                  value={comparisonDate || ''}
                  onChange={(e) => setComparisonDate(e.target.value)}
                  className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                />
              )}
            </div>

            {/* Alert Thresholds */}
            <div>
              <h3 className="font-medium mb-2">Alert Thresholds</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Fear & Greed</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={alertThresholds.fearGreed.min}
                      onChange={(e) => setAlertThresholds(prev => ({
                        ...prev,
                        fearGreed: { ...prev.fearGreed, min: Number(e.target.value) }
                      }))}
                      className={`w-20 p-1 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={alertThresholds.fearGreed.max}
                      onChange={(e) => setAlertThresholds(prev => ({
                        ...prev,
                        fearGreed: { ...prev.fearGreed, max: Number(e.target.value) }
                      }))}
                      className={`w-20 p-1 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Market Cap Change (%)</label>
                  <input
                    type="number"
                    value={alertThresholds.marketCap.change}
                    onChange={(e) => setAlertThresholds(prev => ({
                      ...prev,
                      marketCap: { change: Number(e.target.value) }
                    }))}
                    className={`w-20 p-1 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                  />
                </div>
              </div>
            </div>

            {/* Chart Options */}
            <div>
              <h3 className="font-medium mb-2">Chart Options</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={chartAnnotations}
                    onChange={(e) => setChartAnnotations(e.target.checked)}
                    className="mr-2"
                  />
                  Show Annotations
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showPredictions}
                    onChange={(e) => setShowPredictions(e.target.checked)}
                    className="mr-2"
                  />
                  Show Predictions
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={technicalIndicators.rsi.enabled}
                    onChange={(e) => setTechnicalIndicators(prev => ({ ...prev, rsi: { ...prev.rsi, enabled: e.target.checked } }))}
                    className="mr-2"
                  />
                  Show RSI
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={technicalIndicators.macd.enabled}
                    onChange={(e) => setTechnicalIndicators(prev => ({ ...prev, macd: { ...prev.macd, enabled: e.target.checked } }))}
                    className="mr-2"
                  />
                  Show MACD
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={technicalIndicators.bollingerBands.enabled}
                    onChange={(e) => setTechnicalIndicators(prev => ({ ...prev, bollingerBands: { ...prev.bollingerBands, enabled: e.target.checked } }))}
                    className="mr-2"
                  />
                  Show Bollinger Bands
                </label>
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h3 className="font-medium mb-2">Export Data</h3>
              <div className="flex space-x-4">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Export
                </button>
              </div>
            </div>

            {/* Custom Date Range */}
            <div>
              <h3 className="font-medium mb-2">Custom Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    value={customDateRange.start || ''}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    value={customDateRange.end || ''}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Tools */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Professional Tools</h2>
            <button
              onClick={() => document.getElementById('proTools').classList.toggle('hidden')}
              className="text-blue-500 hover:text-blue-600"
            >
              Toggle Professional Tools
            </button>
          </div>
          
          <div id="proTools" className="hidden space-y-6">
            {/* Technical Indicators */}
            <div>
              <h3 className="font-medium mb-3">Technical Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* RSI Settings */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={technicalIndicators.rsi.enabled}
                      onChange={(e) => setTechnicalIndicators(prev => ({
                        ...prev,
                        rsi: { ...prev.rsi, enabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    RSI
                  </label>
                  {technicalIndicators.rsi.enabled && (
                    <input
                      type="number"
                      value={technicalIndicators.rsi.period}
                      onChange={(e) => setTechnicalIndicators(prev => ({
                        ...prev,
                        rsi: { ...prev.rsi, period: Number(e.target.value) }
                      }))}
                      className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                      placeholder="Period"
                    />
                  )}
                </div>

                {/* MACD Settings */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={technicalIndicators.macd.enabled}
                      onChange={(e) => setTechnicalIndicators(prev => ({
                        ...prev,
                        macd: { ...prev.macd, enabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    MACD
                  </label>
                  {technicalIndicators.macd.enabled && (
                    <div className="space-y-1">
                      <input
                        type="number"
                        value={technicalIndicators.macd.fastPeriod}
                        onChange={(e) => setTechnicalIndicators(prev => ({
                          ...prev,
                          macd: { ...prev.macd, fastPeriod: Number(e.target.value) }
                        }))}
                        className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                        placeholder="Fast Period"
                      />
                      <input
                        type="number"
                        value={technicalIndicators.macd.slowPeriod}
                        onChange={(e) => setTechnicalIndicators(prev => ({
                          ...prev,
                          macd: { ...prev.macd, slowPeriod: Number(e.target.value) }
                        }))}
                        className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                        placeholder="Slow Period"
                      />
                    </div>
                  )}
                </div>

                {/* Bollinger Bands Settings */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={technicalIndicators.bollingerBands.enabled}
                      onChange={(e) => setTechnicalIndicators(prev => ({
                        ...prev,
                        bollingerBands: { ...prev.bollingerBands, enabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    Bollinger Bands
                  </label>
                  {technicalIndicators.bollingerBands.enabled && (
                    <div className="space-y-1">
                      <input
                        type="number"
                        value={technicalIndicators.bollingerBands.period}
                        onChange={(e) => setTechnicalIndicators(prev => ({
                          ...prev,
                          bollingerBands: { ...prev.bollingerBands, period: Number(e.target.value) }
                        }))}
                        className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                        placeholder="Period"
                      />
                      <input
                        type="number"
                        value={technicalIndicators.bollingerBands.stdDev}
                        onChange={(e) => setTechnicalIndicators(prev => ({
                          ...prev,
                          bollingerBands: { ...prev.bollingerBands, stdDev: Number(e.target.value) }
                        }))}
                        className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                        placeholder="Standard Deviations"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Correlation Analysis */}
            <div>
              <h3 className="font-medium mb-3">Correlation Analysis</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCorrelationMetrics.length > 1}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCorrelationMetrics(DEFAULT_CORRELATION_METRICS);
                      } else {
                        setSelectedCorrelationMetrics([]);
                      }
                    }}
                    className="mr-2"
                  />
                  Enable Correlation Analysis
                </label>
                {selectedCorrelationMetrics.length > 1 && (
                  <div className="space-y-2">
                    <label className="block text-sm">Select Metrics to Correlate</label>
                    <div className="space-x-4">
                      {['price', 'volume', 'marketCap', 'holders'].map(metric => (
                        <label key={metric} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCorrelationMetrics.includes(metric)}
                            onChange={(e) => {
                              const metrics = e.target.checked
                                ? [...selectedCorrelationMetrics, metric]
                                : selectedCorrelationMetrics.filter(m => m !== metric);
                              setSelectedCorrelationMetrics(metrics);
                            }}
                            className="mr-2"
                          />
                          {metric}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h3 className="font-medium mb-3">Notifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email Notifications */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email.enabled}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, enabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    Email Notifications
                  </label>
                  {notificationSettings.email.enabled && (
                    <input
                      type="email"
                      value={notificationSettings.email.address}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, address: e.target.value }
                      }))}
                      className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                      placeholder="Email Address"
                    />
                  )}
                </div>

                {/* Browser Notifications */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.browser.enabled}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        browser: { ...prev.browser, enabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    Browser Notifications
                  </label>
                </div>

                {/* Telegram Notifications */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationSettings.telegram.enabled}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        telegram: { ...prev.telegram, enabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    Telegram Notifications
                  </label>
                  {notificationSettings.telegram.enabled && (
                    <input
                      type="text"
                      value={notificationSettings.telegram.chatId}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        telegram: { ...prev.telegram, chatId: e.target.value }
                      }))}
                      className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                      placeholder="Telegram Chat ID"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Layout Settings */}
            <div>
              <h3 className="font-medium mb-3">Layout Customization</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chart Size */}
                <div>
                  <label className="block text-sm mb-2">Chart Size</label>
                  <select
                    value={reportSettings.schedule}
                    onChange={(e) => setReportSettings(prev => ({
                      ...prev,
                      schedule: e.target.value
                    }))}
                    className={`w-full p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-white'} border border-gray-300`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {/* Custom Theme Colors */}
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={reportSettings.format === 'pdf'}
                      onChange={(e) => setReportSettings(prev => ({
                        ...prev,
                        format: e.target.checked ? 'pdf' : 'json'
                      }))}
                      className="mr-2"
                    />
                    Generate PDF Report
                  </label>
                </div>
              </div>
            </div>

            {/* Automated Reports */}
            <div>
              <h3 className="font-medium mb-3">Automated Reports</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportSettings.sections.includes('overview')}
                    onChange={(e) => {
                      const sections = e.target.checked
                        ? [...reportSettings.sections, 'overview']
                        : reportSettings.sections.filter(s => s !== 'overview');
                      setReportSettings(prev => ({ ...prev, sections }));
                    }}
                    className="mr-2"
                  />
                  Include Overview
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportSettings.sections.includes('technical')}
                    onChange={(e) => {
                      const sections = e.target.checked
                        ? [...reportSettings.sections, 'technical']
                        : reportSettings.sections.filter(s => s !== 'technical');
                      setReportSettings(prev => ({ ...prev, sections }));
                    }}
                    className="mr-2"
                  />
                  Include Technical Analysis
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportSettings.sections.includes('correlation')}
                    onChange={(e) => {
                      const sections = e.target.checked
                        ? [...reportSettings.sections, 'correlation']
                        : reportSettings.sections.filter(s => s !== 'correlation');
                      setReportSettings(prev => ({ ...prev, sections }));
                    }}
                    className="mr-2"
                  />
                  Include Correlation Analysis
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportSettings.sections.includes('predictions')}
                    onChange={(e) => {
                      const sections = e.target.checked
                        ? [...reportSettings.sections, 'predictions']
                        : reportSettings.sections.filter(s => s !== 'predictions');
                      setReportSettings(prev => ({ ...prev, sections }));
                    }}
                    className="mr-2"
                  />
                  Include Predictions
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Fear & Greed Trend */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className="text-xl font-bold mb-4">Fear & Greed Index Trend</h2>
            <div className="h-[400px]">
              <Line data={fearGreedChartData} options={chartOptions} />
            </div>
          </div>

          {/* Market State Trend */}
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className="text-xl font-bold mb-4">Market State Trend</h2>
            <div className="h-[400px]">
              <Line data={marketStateChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-bold mb-4">Market Status</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-gray-500 mb-1">Blockchain</h3>
              <p className="text-lg font-semibold capitalize">{data.blockchain}</p>
              <p className="text-sm text-gray-500">Network</p>
            </div>
            <div>
              <h3 className="text-gray-500 mb-1">Chain ID</h3>
              <p className="text-lg font-semibold">{data.chain_id}</p>
              <p className="text-sm text-gray-500">Network identifier</p>
            </div>
            <div>
              <h3 className="text-gray-500 mb-1">Last Updated</h3>
              <p className="text-lg font-semibold">
                {new Date(data.block_dates[0]).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Latest data timestamp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTScoresInsights;
