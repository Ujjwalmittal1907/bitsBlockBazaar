import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FuturisticLoader, FuturisticCard } from './shared';
import ModernLoader from './ModernLoader';

const CollectionAnalytics = () => {
  const [data, setData] = useState(null);
  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    totalSales: 0,
    totalVolume: 0,
    totalTransactions: 0,
    uniqueBuyers: 0,
    uniqueSellers: 0,
    averagePrice: 0
  });
  const [selectedGraph, setSelectedGraph] = useState('sales');
  const [highlightedCollection, setHighlightedCollection] = useState('');
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const timeRangeOptions = [
    { value: '15m', label: 'Last 15 Minutes', description: 'Most recent activity' },
    { value: '30m', label: 'Last 30 Minutes', description: 'Short-term trends' },
    { value: '24h', label: 'Last 24 Hours', description: 'Daily overview' },
    { value: '7d', label: 'Last 7 Days', description: 'Weekly analysis' },
    { value: '30d', label: 'Last 30 Days', description: 'Monthly trends' },
    { value: '90d', label: 'Last 90 Days', description: 'Quarterly view' },
    { value: 'all', label: 'All Time', description: 'Complete history' }
  ];

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
      background: isDark ? '#1f2937' : 'white',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      minHeight: '42px',
      '&:hover': {
        borderColor: isDark ? '#4b5563' : '#d1d5db'
      }
    }),
    menu: (base) => ({
      ...base,
      background: isDark ? '#1f2937' : 'white',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      background: isSelected 
        ? '#3b82f6'
        : isFocused 
          ? (isDark ? '#374151' : '#f3f4f6')
          : 'transparent',
      color: isSelected 
        ? 'white'
        : isDark ? 'white' : '#1f2937',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? 'white' : '#1f2937',
      fontSize: '0.95rem'
    }),
    input: (base) => ({
      ...base,
      color: isDark ? 'white' : '#1f2937'
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? '#9ca3af' : '#6b7280',
      fontSize: '0.95rem'
    }),
    multiValue: (base) => ({
      ...base,
      background: isDark ? '#374151' : '#e5e7eb'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? 'white' : '#1f2937',
      fontSize: '0.9rem'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? '#9ca3af' : '#6b7280',
      ':hover': {
        background: isDark ? '#4b5563' : '#d1d5db',
        color: isDark ? 'white' : '#1f2937'
      }
    })
  };

  const getLoadingMessage = () => {
    switch(timeRange) {
      case '15m':
        return 'Analyzing last 15 minutes of collection data...';
      case '30m':
        return 'Processing last 30 minutes of market activity...';
      case '24h':
        return 'Gathering 24-hour collection performance...';
      case '7d':
        return 'Compiling weekly collection statistics...';
      case '30d':
        return 'Analyzing monthly collection trends...';
      case '90d':
        return 'Processing quarterly collection data...';
      case 'all':
        return 'Retrieving complete collection history...';
      default:
        return 'Loading collection analytics...';
    }
  };

  const getTimeRangeLabel = () => {
    const option = timeRangeOptions.find(opt => opt.value === timeRange);
    return option ? option.label : 'Last 24 Hours';
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const options = {
        method: 'GET',
        headers: { 
          accept: 'application/json', 
          'x-api-key': process.env.REACT_APP_X_API_KEY 
        }
      };

      try {
        const response = await fetch(
          `https://api.unleashnfts.com/api/v2/nft/collection/analytics?blockchain=ethereum&offset=0&limit=30&sort_by=sales&time_range=${timeRange}&sort_order=desc`,
          options
        );
        const result = await response.json();
        setData(result.data);
        
        // Calculate aggregate metrics
        if (result.data && result.data.length > 0) {
          const metrics = result.data.reduce((acc, collection) => {
            return {
              totalSales: acc.totalSales + (collection.sales || 0),
              totalVolume: acc.totalVolume + (collection.volume || 0),
              totalTransactions: acc.totalTransactions + (collection.transactions || 0),
              uniqueBuyers: acc.uniqueBuyers + (collection.unique_buyers || 0),
              uniqueSellers: acc.uniqueSellers + (collection.unique_sellers || 0),
              averagePrice: collection.volume && collection.sales ? 
                (acc.averagePrice * acc.count + collection.volume / collection.sales) / (acc.count + 1) : 
                acc.averagePrice,
              count: acc.count + 1
            };
          }, {
            totalSales: 0,
            totalVolume: 0,
            totalTransactions: 0,
            uniqueBuyers: 0,
            uniqueSellers: 0,
            averagePrice: 0,
            count: 0
          });
          
          setAnalyticsMetrics(metrics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  const getBlockchainIcon = (blockchain) => {
    switch(blockchain?.toLowerCase()) {
      case 'ethereum':
        return '';
      case 'polygon':
        return '';
      case 'solana':
        return '';
      default:
        return '';
    }
  };

  const lineData = {
    labels: data && data.length > 0 && data[0].block_dates ? 
      data[0].block_dates.map(date => formatDate(date)) : [],
    datasets: data ? data
      .filter(item => selectedCollections.includes(item.collection || item.contract_address))
      .map((item, index) => {
        const gradientColors = [
          ['rgba(56, 189, 248, 0.8)', 'rgba(56, 189, 248, 0.1)'],  // Sky blue
          ['rgba(251, 146, 60, 0.8)', 'rgba(251, 146, 60, 0.1)'],  // Orange
          ['rgba(168, 85, 247, 0.8)', 'rgba(168, 85, 247, 0.1)'],  // Purple
          ['rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.1)'],    // Green
          ['rgba(236, 72, 153, 0.8)', 'rgba(236, 72, 153, 0.1)'],  // Pink
          ['rgba(14, 165, 233, 0.8)', 'rgba(14, 165, 233, 0.1)'],  // Lighter blue
          ['rgba(249, 115, 22, 0.8)', 'rgba(249, 115, 22, 0.1)'],  // Darker orange
          ['rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.1)'],  // Violet
        ];
        
        const [baseColor, fadeColor] = gradientColors[index % gradientColors.length];
        const borderColor = baseColor.replace('0.8', '1');
        
        return {
          label: `${getBlockchainIcon(item.blockchain)} ${item.collection_name || item.contract_address}`,
          data: item.sales_trend || [],
          fill: true,
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return null;
            
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, fadeColor);
            return gradient;
          },
          borderColor: borderColor,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'white',
          pointBorderColor: borderColor,
          pointBorderWidth: 2,
          borderWidth: 3,
          cubicInterpolationMode: 'monotone',
          segment: {
            borderColor: ctx => skipped(ctx, borderColor),
          },
          spanGaps: true
        };
      }) : []
  };

  const skipped = (ctx, color) => {
    if (ctx.p0.skip || ctx.p1.skip) return 'rgba(0,0,0,0)';
    return color;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: 'white',
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        bodySpacing: 4,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const item = data.find(d => 
              (d.collection_name || d.contract_address) === context.dataset.label.substring(2)
            );
            const volume = item?.volume_trend[context.dataIndex]?.toFixed(2) || 0;
            const price = volume / context.parsed.y;
            return [
              `${context.dataset.label}: ${context.parsed.y} sales`,
              `Volume: ${volume} ETH`,
              `Avg Price: ${price.toFixed(4)} ETH`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11
          },
          callback: function(value) {
            if (value >= 1000) {
              return (value/1000).toFixed(1) + 'k';
            }
            return value;
          }
        }
      }
    }
  };

  const salesData = {
    labels: data ? data.map(item => item.collection || item.contract_address) : [],
    datasets: [
      {
        label: 'Sales',
        data: data ? data.map(item => item.sales || 0) : [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const volumeData = {
    labels: data ? data.map(item => item.collection || item.contract_address) : [],
    datasets: [
      {
        label: 'Volume',
        data: data ? data.map(item => item.volume || 0) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: data ? data.map(item => item.collection || item.contract_address) : [],
    datasets: [
      {
        label: 'Assets',
        data: data ? data.map(item => item.assets || 0) : [],
        backgroundColor: data ? data.map((_, index) => `rgba(59, 130, 246, 0.6)`).map((color, index) => index === 0 ? 'rgba(255, 99, 132, 0.6)' : color) : [],
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const renderGraph = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <ModernLoader size="large" text={getLoadingMessage()} />
          <p className="mt-4 text-gray-400 animate-pulse">
            {timeRange === '15m' || timeRange === '30m' 
              ? 'Real-time data processing...'
              : timeRange === '7d' || timeRange === '30d' || timeRange === '90d'
                ? 'Aggregating historical data...'
                : 'Fetching collection metrics...'}
          </p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 14h.01M12 16h.01M12 18h.01M12 20h.01M12 22h.01" />
          </svg>
          <p className="text-xl font-semibold">No Data Available</p>
          <p className="text-sm mt-2">Try selecting a different time range or collection</p>
        </div>
      );
    }

    switch (selectedGraph) {
      case 'sales':
        return <Bar data={salesData} options={chartOptions} />;
      case 'volume':
        return <Bar data={volumeData} options={chartOptions} />;
      case 'assets':
        return <Pie data={pieData} options={chartOptions} />;
      case 'trend':
        if (selectedCollections.length === 0) {
          return <div className="flex flex-col justify-center items-center h-full text-white space-y-4">
            <p>Please select collections to view trend analysis</p>
            <p className="text-sm text-gray-400">You can compare sales trends across different collections</p>
          </div>;
        }
        return <div className="relative h-96">
          <Line data={lineData} options={chartOptions} />
        </div>;
      default:
        return null;
    }
  };

  const getMetricCard = (title, value, icon, suffix = '') => (
    <FuturisticCard className="p-4 text-center">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold mt-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </div>
    </FuturisticCard>
  );

  const renderMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {getMetricCard('Total Sales', analyticsMetrics.totalSales, 
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )}
      {getMetricCard('Total Volume', analyticsMetrics.totalVolume.toFixed(2), 
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>,
        ' ETH'
      )}
      {getMetricCard('Unique Buyers', analyticsMetrics.uniqueBuyers,
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )}
    </div>
  );

  const collectionOptions = data ? data.map(item => ({
    value: item.collection || item.contract_address,
    label: item.collection || item.contract_address
  })) : [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <ModernLoader size="large" text={getLoadingMessage()} />
        <p className="text-gray-400 animate-pulse">
          {timeRange === '15m' || timeRange === '30m' 
            ? 'Processing real-time market data...'
            : timeRange === '7d' || timeRange === '30d' || timeRange === '90d'
              ? 'Analyzing historical trends...'
              : 'Fetching collection insights...'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <BackButton onClick={() => navigate(-1)} />
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Collection Analytics</h1>
          
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-32 bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-32 bg-gray-800 rounded-lg animate-pulse" />
              <div className="h-32 bg-gray-800 rounded-lg animate-pulse" />
            </div>
          ) : (
            renderMetrics()
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <Select
              isMulti
              className="min-w-[250px] z-10"
              options={data?.map(item => ({
                value: item.collection || item.contract_address,
                label: item.collection_name || item.contract_address,
                data: item
              })) || []}
              value={selectedCollections.map(value => ({
                value,
                label: data?.find(item => (item.collection || item.contract_address) === value)?.collection_name || value
              }))}
              onChange={(selected) => setSelectedCollections(selected?.map(option => option.value) || [])}
              placeholder={isLoading ? "Loading collections..." : "Select collections..."}
              isDisabled={isLoading}
              styles={customSelectStyles}
            />
            
            <Select
              className="min-w-[200px] z-10"
              options={timeRangeOptions}
              value={timeRangeOptions.find(option => option.value === timeRange)}
              onChange={(selected) => setTimeRange(selected.value)}
              placeholder={isLoading ? "Loading..." : "Select time range..."}
              isDisabled={isLoading}
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
            
            <div className="flex gap-2">
              {['sales', 'volume', 'assets', 'trend'].map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGraph(type)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedGraph === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div 
            className="relative w-full bg-gray-800 p-4 rounded-lg shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ minHeight: '500px' }}
          >
            {renderGraph()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionAnalytics;