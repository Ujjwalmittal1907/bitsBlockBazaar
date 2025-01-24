import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import LoadingSpinner from './shared/LoadingSpinner';
import FuturisticCard from './shared/FuturisticCard';
import FuturisticTable from './shared/FuturisticTable';
import FuturisticLoader from './shared/FuturisticLoader';
import ModernLoader from './ModernLoader';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Select from 'react-select';

const NftMarketplaceWashTraders = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockchainFilter, setBlockchainFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [nameFilter, setNameFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const { isDark } = useTheme();

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours', description: 'Daily overview' },
    { value: '7d', label: 'Last 7 Days', description: 'Weekly analysis' },
    { value: '30d', label: 'Last 30 Days', description: 'Monthly trends' },
    { value: '90d', label: 'Last 90 Days', description: 'Quarterly view' },
    { value: 'all', label: 'All Time', description: 'Complete history' }
  ];

  const blockchains = [
    { value: 'all', label: 'All Blockchains' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'solana', label: 'Solana' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'avalanche', label: 'Avalanche' }
  ];

  useEffect(() => {
    fetchData();
  }, [timeRange, blockchainFilter]);

  const fetchData = async () => {
    setLoading(true);
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    try {
      const blockchain = blockchainFilter === 'all' ? '' : `blockchain=${blockchainFilter}&`;
      const response = await fetch(
        `https://api.unleashnfts.com/api/v2/nft/marketplace/washtrade?${blockchain}time_range=${timeRange}&sort_by=name&sort_order=desc&offset=0&limit=90`,
        options
      );
      const result = await response.json();
      setData(result.data);
      setFilteredData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = data.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(nameFilter.toLowerCase());
      const risk = getRiskLevel(item.washtrade_suspect_sales_ratio);
      const riskMatch = !riskFilter || risk.text === riskFilter;
      return nameMatch && riskMatch;
    });
    setFilteredData(filtered);
  }, [nameFilter, riskFilter, data]);

  const getRiskLevel = (ratio) => {
    if (!ratio || ratio === 0) return { text: 'No Risk', color: 'text-green-500' };
    if (ratio >= 0.0002) return { text: 'High Risk', color: 'text-red-500' };
    if (ratio >= 0.0001) return { text: 'Medium Risk', color: 'text-yellow-500' };
    return { text: 'Low Risk', color: 'text-blue-500' };
  };

  const formatVolume = (volume) => {
    if (!volume) return '$0';
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatRatio = (ratio) => {
    if (ratio === null || ratio === undefined) return 'N/A';
    
    // Convert to percentage
    const percentage = ratio * 100;
    
    // Format the exact number for the tooltip
    let exactValue;
    if (percentage < 0.0001) {
      exactValue = percentage.toExponential(4);
    } else if (percentage < 0.01) {
      exactValue = percentage.toFixed(6);
    } else if (percentage < 1) {
      exactValue = percentage.toFixed(4);
    } else {
      exactValue = percentage.toFixed(2);
    }
    
    // User-friendly format for display
    if (percentage < 0.0001) {
      return {
        display: '< 0.0001%',
        exact: `${exactValue}%`,
        severity: 'minimal'
      };
    } else if (percentage < 0.001) {
      return {
        display: '< 0.001%',
        exact: `${exactValue}%`,
        severity: 'very-low'
      };
    } else if (percentage < 0.01) {
      return {
        display: '< 0.01%',
        exact: `${exactValue}%`,
        severity: 'low'
      };
    } else if (percentage < 0.1) {
      return {
        display: `${percentage.toFixed(3)}%`,
        exact: `${exactValue}%`,
        severity: 'moderate'
      };
    } else if (percentage < 1) {
      return {
        display: `${percentage.toFixed(2)}%`,
        exact: `${exactValue}%`,
        severity: 'high'
      };
    } else {
      return {
        display: `${percentage.toFixed(1)}%`,
        exact: `${exactValue}%`,
        severity: 'very-high'
      };
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'minimal':
        return 'text-gray-500 dark:text-gray-400';
      case 'very-low':
        return 'text-blue-500 dark:text-blue-400';
      case 'low':
        return 'text-green-500 dark:text-green-400';
      case 'moderate':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'high':
        return 'text-orange-500 dark:text-orange-400';
      case 'very-high':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'minimal':
        return 'Minimal Risk';
      case 'very-low':
        return 'Very Low Risk';
      case 'low':
        return 'Low Risk';
      case 'moderate':
        return 'Moderate Risk';
      case 'high':
        return 'High Risk';
      case 'very-high':
        return 'Very High Risk';
      default:
        return 'Unknown Risk';
    }
  };

  const getVolumeChangeIndicator = (change) => {
    if (!change) return null;
    return change > 0 ? 
      <span className="text-green-500">↑ {change.toFixed(2)}%</span> : 
      <span className="text-red-500">↓ {Math.abs(change).toFixed(2)}%</span>;
  };

  // Get top 3 marketplaces by wash trade volume
  const topMarketplaces = [...data]
    .sort((a, b) => b.washtrade_volume - a.washtrade_volume)
    .slice(0, 3);

  const headers = [
    { key: 'marketplace', label: 'Marketplace' },
    { key: 'volume', label: 'Wash Trade Volume (24h)', tooltip: 'Total volume of suspected wash trades in the last 24 hours' },
    { key: 'ratio', label: 'Wash Trade Ratio', tooltip: 'Percentage of total trades suspected to be wash trades' },
    { key: 'risk', label: 'Risk Level', tooltip: 'Risk assessment based on wash trade ratio' },
    { key: 'sales', label: 'Suspect Sales', tooltip: 'Number of sales suspected to be wash trades' },
    { key: 'wallets', label: 'Unique Wallets', tooltip: 'Number of unique wallets involved in suspected wash trades' }
  ];

  const tableData = filteredData.map(item => {
    const ratio = formatRatio(item.washtrade_suspect_sales_ratio);
    return {
      marketplace: (
        <div className="flex items-center space-x-3">
          {item.thumbnail_url ? (
            <img 
              src={item.thumbnail_url} 
              alt={item.name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://via.placeholder.com/32/475569/FFFFFF?text=${item.name.charAt(0).toUpperCase()}`;
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {item.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {item.name}
            </span>
            {item.url && (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
              >
                Visit site
              </a>
            )}
          </div>
        </div>
      ),
      volume: (
        <div className="space-y-1">
          <div className="font-medium">
            {formatVolume(item.washtrade_volume || 0)}
          </div>
          {item.washtrade_volume_change !== null && (
            <div className={`text-xs ${item.washtrade_volume_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {item.washtrade_volume_change >= 0 ? '↑' : '↓'} {Math.abs(item.washtrade_volume_change).toFixed(2)}%
            </div>
          )}
        </div>
      ),
      ratio: (
        <div className="flex items-center space-x-2" title={`Exact value: ${ratio.exact}`}>
          <span className={`font-medium ${getSeverityColor(ratio.severity)}`}>
            {ratio.display}
          </span>
          <span className={`text-xs ${getSeverityColor(ratio.severity)}`}>
            ({getSeverityLabel(ratio.severity)})
          </span>
        </div>
      ),
      risk: (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          getSeverityColor(ratio.severity)
        }`}>
          {getSeverityLabel(ratio.severity)}
        </div>
      ),
      sales: (
        <div className="space-y-1">
          <div className="font-medium">
            {item.washtrade_suspect_sales || '0'}
          </div>
          {item.washtrade_suspect_sales_change !== null && (
            <div className={`text-xs ${item.washtrade_suspect_sales_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {item.washtrade_suspect_sales_change >= 0 ? '↑' : '↓'} {Math.abs(item.washtrade_suspect_sales_change).toFixed(2)}%
            </div>
          )}
        </div>
      ),
      wallets: (
        <div className="space-y-1">
          <div className="font-medium">
            {item.washtrade_wallets || '0'}
          </div>
          {item.washtrade_wallets_change !== null && (
            <div className={`text-xs ${item.washtrade_wallets_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {item.washtrade_wallets_change >= 0 ? '↑' : '↓'} {Math.abs(item.washtrade_wallets_change).toFixed(2)}%
            </div>
          )}
        </div>
      )
    };
  });

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

  const getLoadingMessage = () => {
    switch (timeRange) {
      case '24h':
        return 'Compiling daily wash trading statistics...';
      case '7d':
        return 'Analyzing weekly wash trading trends...';
      case '30d':
        return 'Gathering monthly wash trading data...';
      case '90d':
        return 'Processing quarterly wash trading patterns...';
      case 'all':
        return 'Analyzing historical wash trading data...';
      default:
        return 'Loading data...';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <ModernLoader size="large" text={getLoadingMessage()} />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {getLoadingMessage()}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <BackButton />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            NFT Marketplace Wash Trading Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Monitor and analyze wash trading activities across different marketplaces and time periods
          </p>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Select
              value={timeRanges.find(range => range.value === timeRange)}
              onChange={(option) => setTimeRange(option.value)}
              options={timeRanges}
              components={{ Option: CustomTimeRangeOption }}
              className="react-select-container"
              classNamePrefix="react-select"
              isSearchable={false}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'white',
                  borderColor: isDark ? 'rgba(107, 114, 128, 0.3)' : base.borderColor,
                  '&:hover': {
                    borderColor: isDark ? 'rgba(107, 114, 128, 0.5)' : base.borderColor
                  }
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: isDark ? '#1F2937' : 'white',
                  zIndex: 50
                }),
                menuList: (base) => ({
                  ...base,
                  padding: 0
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: isDark 
                    ? state.isSelected 
                      ? '#3B82F6'
                      : state.isFocused 
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'transparent'
                    : state.isSelected
                      ? '#3B82F6'
                      : state.isFocused
                        ? '#F3F4F6'
                        : 'transparent',
                  color: state.isSelected ? 'white' : isDark ? '#E5E7EB' : '#1F2937',
                  cursor: 'pointer',
                  ':active': {
                    backgroundColor: state.isSelected ? '#2563EB' : '#E5E7EB'
                  }
                }),
                singleValue: (base) => ({
                  ...base,
                  color: isDark ? '#E5E7EB' : '#1F2937'
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  ':hover': {
                    color: isDark ? '#E5E7EB' : '#4B5563'
                  }
                }),
                indicatorSeparator: (base) => ({
                  ...base,
                  backgroundColor: isDark ? 'rgba(156, 163, 175, 0.3)' : '#E5E7EB'
                })
              }}
            />

            <select
              value={blockchainFilter}
              onChange={(e) => setBlockchainFilter(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {blockchains.map(chain => (
                <option key={chain.value} value={chain.value}>
                  {chain.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by marketplace name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value="High Risk">High Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="Low Risk">Low Risk</option>
              <option value="No Risk">No Risk</option>
            </select>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Wash Trade Volume</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatVolume(data.reduce((sum, item) => sum + (item.washtrade_volume || 0), 0))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Suspect Sales</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.reduce((sum, item) => sum + parseInt(item.washtrade_suspect_sales || 0), 0)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Active Wallets</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.reduce((sum, item) => sum + parseInt(item.washtrade_wallets || 0), 0)}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {headers.map(header => (
                      <th 
                        key={header.key}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        title={header.tooltip}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {tableData.map((item, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {headers.map(header => (
                        <td key={header.key} className="px-6 py-4 whitespace-nowrap">
                          {item[header.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftMarketplaceWashTraders;