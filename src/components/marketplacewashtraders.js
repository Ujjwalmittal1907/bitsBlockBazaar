import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import LoadingSpinner from './shared/LoadingSpinner';
import FuturisticCard from './shared/FuturisticCard';
import FuturisticTable from './shared/FuturisticTable';
import FuturisticLoader from './shared/FuturisticLoader';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const NftMarketplaceWashTraders = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockchainFilter, setBlockchainFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/marketplace/washtrade?blockchain=ethereum&time_range=24h&sort_by=name&sort_order=desc&offset=0&limit=30', options)
      .then(response => response.json())
      .then(response => {
        setData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = data.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(nameFilter.toLowerCase());
      const blockchainMatch = !blockchainFilter || item.blockchain === blockchainFilter;
      const risk = getRiskLevel(item.washtrade_suspect_sales_ratio);
      const riskMatch = !riskFilter || risk.text === riskFilter;
      return nameMatch && blockchainMatch && riskMatch;
    });
    setFilteredData(filtered);
  }, [nameFilter, blockchainFilter, riskFilter, data]);

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
    'Marketplace',
    'Volume (24h)',
    'Wash Trade Ratio',
    'Risk Level',
    'Suspect Sales',
    'Wallets'
  ];

  const tableData = filteredData.map(item => ({
    marketplace: (
      <div className="flex items-center space-x-2">
        {item.thumbnail_url && (
          <img 
            src={item.thumbnail_url} 
            alt={item.name} 
            className="w-6 h-6 rounded-full"
          />
        )}
        <span>{item.name}</span>
      </div>
    ),
    volume: (
      <div>
        {formatVolume(item.washtrade_volume)}
        <div className="text-xs">
          {getVolumeChangeIndicator(item.washtrade_volume_change)}
        </div>
      </div>
    ),
    ratio: `${(item.washtrade_suspect_sales_ratio * 100).toFixed(4)}%`,
    risk: (
      <span className={getRiskLevel(item.washtrade_suspect_sales_ratio).color}>
        {getRiskLevel(item.washtrade_suspect_sales_ratio).text}
      </span>
    ),
    sales: `${item.washtrade_suspect_sales || 0}`,
    wallets: `${item.washtrade_wallets || 0}`
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Loading Wash Trade Analysis..." />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`container mx-auto p-4 space-y-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <BackButton />
      
      <FuturisticCard className="p-6">
        <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
          ${isDark ? 'from-red-400 to-purple-600' : 'from-red-600 to-purple-800'} mb-4`}>
          NFT Marketplace Wash Trading Analysis
        </h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Filter by marketplace name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="bg-white/5 border border-gray-700/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <select
            value={blockchainFilter}
            onChange={(e) => setBlockchainFilter(e.target.value)}
            className="bg-white/5 border border-gray-700/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">All Blockchains</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
          </select>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white/5 border border-gray-700/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">All Risk Levels</option>
            <option value="High Risk">High Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="Low Risk">Low Risk</option>
            <option value="No Risk">No Risk</option>
          </select>
        </div>

        {/* Top Marketplaces */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {topMarketplaces.map((item, index) => (
            <FuturisticCard
              key={index}
              className="p-4"
              gradient={`from-${index === 0 ? 'red' : index === 1 ? 'orange' : 'yellow'}-500/10 to-${index === 0 ? 'pink' : index === 1 ? 'red' : 'orange'}-500/10`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {item.thumbnail_url && (
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <h3 className="font-semibold">{item.name}</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-80">
                  Volume: {formatVolume(item.washtrade_volume)}
                  <span className="ml-2 text-xs">
                    {getVolumeChangeIndicator(item.washtrade_volume_change)}
                  </span>
                </p>
                <p className="text-sm opacity-80">
                  Wash Trade Ratio: {(item.washtrade_suspect_sales_ratio * 100).toFixed(4)}%
                </p>
                <div className={`text-xs ${getRiskLevel(item.washtrade_suspect_sales_ratio).color}`}>
                  {getRiskLevel(item.washtrade_suspect_sales_ratio).text}
                </div>
              </div>
            </FuturisticCard>
          ))}
        </div>

        {/* Data Table */}
        <FuturisticTable
          headers={headers}
          data={tableData}
          isLoading={loading}
          onRowClick={(row) => console.log('Clicked row:', row)}
        />
      </FuturisticCard>
    </motion.div>
  );
};

export default NftMarketplaceWashTraders;