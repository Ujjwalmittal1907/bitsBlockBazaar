import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Select from 'react-select';
import { useTheme } from '../../context/ThemeContext';
import ModernLoader from '../ModernLoader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

const NFTWashTradeInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('24h');
  const { isDark } = useTheme();

  const timeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPercentageChange = (change) => {
    if (change === null || change === undefined) return null;
    // Convert from decimal to percentage and handle edge cases
    const percentage = change * 100;
    if (isNaN(percentage)) return null;
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
        `https://api.unleashnfts.com/api/v2/nft/market-insights/washtrade?blockchain=full&time_range=${timePeriod}`,
        options
      );

      if (!response.ok) {
        throw new Error('Failed to fetch wash trade insights');
      }

      const jsonData = await response.json();
      setData(jsonData.data[0]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timePeriod]);

  const getLoadingMessage = () => {
    switch(timePeriod) {
      case '24h':
        return 'Analyzing last 24 hours of wash trading activity...';
      case '7d':
        return 'Processing weekly wash trading patterns...';
      case '30d':
        return 'Analyzing monthly wash trading trends...';
      case 'all':
        return 'Retrieving complete wash trading history...';
      default:
        return 'Loading wash trading insights...';
    }
  };

  const formatAxisDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    switch (timePeriod) {
      case '15m':
      case '30m':
      case '24h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      case '30d':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case '90d':
      case 'all':
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  const getSummaryInsights = () => {
    if (!data) return [];

    const insights = [];
    
    // Volume insights
    const volumeChange = data.washtrade_volume_change;
    const volumeChangeStr = getPercentageChange(volumeChange);
    if (volumeChangeStr) {
      insights.push({
        type: volumeChange >= 0 ? 'warning' : 'success',
        text: `Wash trade volume has ${volumeChange >= 0 ? 'increased' : 'decreased'} by ${volumeChangeStr.replace('+', '')} ${timePeriod === '24h' ? 'in the last 24 hours' : `over the last ${timePeriod}`}`
      });
    }

    // Sales insights
    const salesChange = data.washtrade_suspect_sales_change;
    const salesChangeStr = getPercentageChange(salesChange);
    if (salesChangeStr) {
      insights.push({
        type: salesChange >= 0 ? 'warning' : 'success',
        text: `Suspect sales have ${salesChange >= 0 ? 'increased' : 'decreased'} by ${salesChangeStr.replace('+', '')}`
      });
    }

    // Wallets insights
    const walletsChange = data.washtrade_wallets_change;
    const walletsChangeStr = getPercentageChange(walletsChange);
    if (walletsChangeStr) {
      insights.push({
        type: walletsChange >= 0 ? 'warning' : 'success',
        text: `${walletsChange >= 0 ? 'More' : 'Fewer'} wallets are involved in wash trading (${walletsChangeStr.replace('+', '')} change)`
      });
    }

    // Volume concentration
    const topVolume = parseFloat(data.records?.[0]?.washtrade_volume) || 0;
    const totalVolume = parseFloat(data.washtrade_volume) || 0;
    if (topVolume > 0 && totalVolume > 0) {
      const concentration = (topVolume / totalVolume * 100).toFixed(1);
      insights.push({
        type: concentration > 50 ? 'warning' : 'info',
        text: `Top wash traded NFT accounts for ${concentration}% of total wash trade volume`
      });
    }

    return insights;
  };

  const renderChart = () => {
    const lineChartData = {
      labels: [...(data.block_dates?.map(date => formatAxisDate(date)) || [])].reverse(),
      datasets: [
        {
          label: 'Wash Trade Volume',
          data: [...(data.washtrade_volume_trend || [])].reverse(),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Suspect Sales',
          data: [...(data.washtrade_suspect_sales_trend || [])].reverse(),
          borderColor: 'rgb(244, 63, 94)',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#E2E8F0',
            font: {
              size: 12,
              weight: '500'
            },
            padding: 20
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: '#1E293B',
          titleColor: '#E2E8F0',
          bodyColor: '#E2E8F0',
          borderColor: '#374151',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: (context) => {
              const reversedIndex = data.block_dates.length - 1 - context[0].dataIndex;
              return formatAxisDate(data.block_dates[reversedIndex]);
            },
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
                if (context.dataset.label === 'Wash Trade Volume') {
                  label += formatCurrency(context.raw);
                } else {
                  label += formatNumber(context.raw);
                }
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(226, 232, 240, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#94A3B8',
            font: {
              size: 11
            },
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: {
            color: 'rgba(226, 232, 240, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#94A3B8',
            font: {
              size: 11
            },
            callback: function(value) {
              return formatCurrency(value);
            }
          },
          title: {
            display: true,
            text: 'Volume (ETH)',
            color: '#E2E8F0',
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
            drawBorder: false
          },
          ticks: {
            color: '#94A3B8',
            font: {
              size: 11
            },
            callback: function(value) {
              return formatNumber(value);
            }
          },
          title: {
            display: true,
            text: 'Number of Sales',
            color: '#E2E8F0',
            font: {
              size: 12,
              weight: '500'
            }
          }
        }
      }
    };

    return (
      <Line data={lineChartData} options={chartOptions} />
    );
  };

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
          <ModernLoader text="Loading wash trade insights..." />
        </div>
      ) : (
        <>
          {/* Header with Controls */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-100">Wash Trade Insights</h2>
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
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#1E293B] shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-slate-400">Wash Trade Volume</h3>
              <p className="text-2xl font-semibold mt-1 text-slate-100">{formatNumber(data.washtrade_volume, true)}</p>
              <p className={`text-sm mt-1 ${data.washtrade_volume_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {getPercentageChange(data.washtrade_volume_change)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#1E293B] shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-slate-400">Suspect Sales</h3>
              <p className="text-2xl font-semibold mt-1 text-slate-100">{formatNumber(data.washtrade_suspect_sales)}</p>
              <p className={`text-sm mt-1 ${data.washtrade_suspect_sales_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {getPercentageChange(data.washtrade_suspect_sales_change)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#1E293B] shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-slate-400">Affected Assets</h3>
              <p className="text-2xl font-semibold mt-1 text-slate-100">{formatNumber(data.washtrade_assets)}</p>
              <p className={`text-sm mt-1 ${data.washtrade_assets_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {getPercentageChange(data.washtrade_assets_change)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#1E293B] shadow-lg border border-gray-700">
              <h3 className="text-sm font-medium text-slate-400">Suspect Wallets</h3>
              <p className="text-2xl font-semibold mt-1 text-slate-100">{formatNumber(data.washtrade_wallets)}</p>
              <p className={`text-sm mt-1 ${data.washtrade_wallets_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {getPercentageChange(data.washtrade_wallets_change)}
              </p>
            </div>
          </div>

          {/* Market Summary */}
          <div className="p-4 rounded-xl bg-[#1E293B] shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-slate-100">Market Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getSummaryInsights().map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded ${
                    insight.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
                    insight.type === 'success' ? 'bg-green-500/10 border border-green-500/20' :
                    'bg-blue-500/10 border border-blue-500/20'
                  }`}
                >
                  <p className={`text-sm ${
                    insight.type === 'warning' ? 'text-amber-400' :
                    insight.type === 'success' ? 'text-green-400' :
                    'text-blue-400'
                  }`}>
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="p-4 rounded-xl bg-[#1E293B] shadow-lg border border-gray-700">
            <div className="h-[400px]">
              {renderChart()}
            </div>
          </div>

          {/* Wash Trade Stats Table */}
          <div className="p-4 rounded-xl bg-[#1E293B] shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-slate-100">Suspected Wash Trades</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-2 text-left text-slate-400">Contract</th>
                    <th className="px-4 py-2 text-right text-slate-400">Volume</th>
                    <th className="px-4 py-2 text-right text-slate-400">Suspect Sales</th>
                    <th className="px-4 py-2 text-right text-slate-400">Suspect Transactions</th>
                    <th className="px-4 py-2 text-right text-slate-400">Wallets</th>
                    <th className="px-4 py-2 text-right text-slate-400">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.records?.slice(0, 5).map((item, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-mono text-sm text-slate-300">
                            {item.contract_address.slice(0, 6)}...{item.contract_address.slice(-4)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Token ID: {item.token_id.length > 15 ? item.token_id.slice(0, 15) + '...' : item.token_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-indigo-400">{formatNumber(item.washtrade_volume, true)}</div>
                        <div className="text-xs text-slate-500">ETH</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-slate-300">{item.washtrade_suspect_sales}</div>
                        <div className={`text-xs ${item.washtrade_suspect_sales_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {item.washtrade_suspect_sales_change !== null ? getPercentageChange(item.washtrade_suspect_sales_change) : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-slate-300">{item.washtrade_suspect_transactions}</div>
                        <div className={`text-xs ${item.washtrade_suspect_transactions_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {item.washtrade_suspect_transactions_change !== null ? getPercentageChange(item.washtrade_suspect_transactions_change) : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-slate-300">{item.washtrade_wallets}</div>
                        <div className={`text-xs ${item.washtrade_wallets_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {item.washtrade_wallets_change !== null ? getPercentageChange(item.washtrade_wallets_change) : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={`text-sm ${item.washtrade_volume_change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {item.washtrade_volume_change !== null ? getPercentageChange(item.washtrade_volume_change) : '-'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.washtrade_assets} assets
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs text-slate-500 mt-2 text-right">
                Showing top 5 of {data?.pagination?.total_items?.toLocaleString()} items
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NFTWashTradeInsights;