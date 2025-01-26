import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useTheme } from '../../context/ThemeContext';
import ModernLoader from '../ModernLoader';

const MarketplaceWashTradeInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('24h');
  const [blockchain, setBlockchain] = useState('ethereum');
  const { isDark } = useTheme();

  const timeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const blockchainOptions = [
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'binance', label: 'Binance' },
    { value: 'full', label: 'All Blockchains' }
  ];

  const formatNumber = (num, isCurrency = false) => {
    if (!num && num !== 0) return '-';
    if (isCurrency) {
      return formatCurrency(num);
    }
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPercentageChange = (change) => {
    if (!change && change !== 0) return '-';
    const percentage = change * 100;
    if (isNaN(percentage)) return '-';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
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
        `https://api.unleashnfts.com/api/v2/nft/marketplace/washtrade?blockchain=${blockchain}&time_range=${timePeriod}&sort_by=name&sort_order=desc&offset=0&limit=30`,
        options
      );

      if (!response.ok) {
        throw new Error('Failed to fetch marketplace wash trade insights');
      }

      const jsonData = await response.json();
      setData(jsonData.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timePeriod, blockchain]);

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#1E293B',
      borderColor: '#374151',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#4B5563'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1E293B',
      border: '1px solid #374151',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#374151' : '#1E293B',
      color: '#fff',
      '&:active': {
        backgroundColor: '#2563EB'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff'
    }),
    input: (provided) => ({
      ...provided,
      color: '#fff'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#9CA3AF',
      '&:hover': {
        color: '#fff'
      }
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#374151'
    })
  };

  return (
    <div className="bg-[#0F172A] text-white p-6 rounded-xl space-y-6">
      {error ? (
        <div className="text-red-500 text-center py-4">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <ModernLoader text="Loading marketplace wash trade insights..." />
        </div>
      ) : (
        <>
          {/* Header with Controls */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-100">Marketplace Wash Trade Insights</h2>
            <div className="flex gap-4">
              <Select
                value={timeOptions.find(option => option.value === timePeriod)}
                onChange={(selectedOption) => setTimePeriod(selectedOption.value)}
                options={timeOptions}
                className="w-36"
                classNamePrefix="select"
                isSearchable={false}
                styles={customSelectStyles}
              />
              <Select
                value={blockchainOptions.find(option => option.value === blockchain)}
                onChange={(selectedOption) => setBlockchain(selectedOption.value)}
                options={blockchainOptions}
                className="w-36"
                classNamePrefix="select"
                isSearchable={false}
                styles={customSelectStyles}
              />
            </div>
          </div>

          {/* Marketplace Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left text-slate-400">Marketplace</th>
                  <th className="px-4 py-2 text-right text-slate-400">Volume</th>
                  <th className="px-4 py-2 text-right text-slate-400">Assets</th>
                  <th className="px-4 py-2 text-right text-slate-400">Suspect Sales</th>
                  <th className="px-4 py-2 text-right text-slate-400">Suspect Transactions</th>
                  <th className="px-4 py-2 text-right text-slate-400">Wallets</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.thumbnail_url && (
                          <img 
                            src={item.thumbnail_url} 
                            alt={item.name} 
                            className="w-6 h-6 rounded-full"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div>
                          <div className="font-medium text-slate-300">
                            {item.name}
                          </div>
                          {item.url && (
                            <a 
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Visit
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-indigo-400">{formatNumber(item.washtrade_volume, true)}</div>
                      <div className={`text-xs ${item.washtrade_volume_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {getPercentageChange(item.washtrade_volume_change)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-slate-300">{formatNumber(item.washtrade_assets)}</div>
                      <div className={`text-xs ${item.washtrade_assets_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {getPercentageChange(item.washtrade_assets_change)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-slate-300">{formatNumber(item.washtrade_suspect_sales)}</div>
                      <div className={`text-xs ${item.washtrade_suspect_sales_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {getPercentageChange(item.washtrade_suspect_sales_change)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-slate-300">{formatNumber(item.washtrade_suspect_transactions)}</div>
                      <div className={`text-xs ${item.washtrade_suspect_transactions_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {getPercentageChange(item.washtrade_suspect_transactions_change)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-slate-300">{formatNumber(item.washtrade_wallets)}</div>
                      <div className={`text-xs ${item.washtrade_wallets_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {getPercentageChange(item.washtrade_wallets_change)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketplaceWashTradeInsights;
