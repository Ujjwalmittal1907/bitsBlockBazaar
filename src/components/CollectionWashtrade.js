import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import LoadingSpinner from './shared/LoadingSpinner';
import FuturisticCard from './shared/FuturisticCard';
import FuturisticTable from './shared/FuturisticTable';
import FuturisticSelect from './shared/FuturisticSelect';
import { motion } from 'framer-motion';

const CollectionWashtrade = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [blockchainFilter, setBlockchainFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-api-key': process.env.REACT_APP_X_API_KEY
      }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/collection/washtrade?blockchain=ethereum&time_range=24h&sort_by=name&sort_order=desc&offset=0&limit=30', options)
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
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const blockchainMatch = !blockchainFilter || item.blockchain === blockchainFilter;
      const risk = getRiskLevel(item.washtrade_suspect_sales_ratio);
      const riskMatch = !riskFilter || risk.text === riskFilter;
      return nameMatch && blockchainMatch && riskMatch;
    });
    setFilteredData(filtered);
  }, [searchTerm, blockchainFilter, riskFilter, data]);

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

  const getWalletChangeIndicator = (change) => {
    if (!change) return null;
    return change > 0 ? 
      <span className="text-green-500">↑ {(change * 100).toFixed(2)}%</span> : 
      <span className="text-red-500">↓ {Math.abs(change * 100).toFixed(2)}%</span>;
  };

  // Get top 3 collections by wash trade volume
  const topCollections = [...data]
    .sort((a, b) => b.washtrade_volume - a.washtrade_volume)
    .slice(0, 3);

  const headers = [
    'Collection',
    'Volume (24h)',
    'Wash Trade Ratio',
    'Risk Level',
    'Suspect Sales',
    'Wallets'
  ];

  const tableData = filteredData.map(item => ({
    collection: (
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
    ratio: (
      <div>
        {(item.washtrade_suspect_sales_ratio * 100).toFixed(4)}%
        <div className="text-xs">
          {item.washtrade_suspect_sales_ratio_change && 
            (item.washtrade_suspect_sales_ratio_change > 0 ? 
              <span className="text-red-500">↑</span> : 
              <span className="text-green-500">↓</span>
            )
          }
        </div>
      </div>
    ),
    risk: (
      <span className={getRiskLevel(item.washtrade_suspect_sales_ratio).color}>
        {getRiskLevel(item.washtrade_suspect_sales_ratio).text}
      </span>
    ),
    sales: (
      <div>
        {item.washtrade_suspect_sales || 0}
        <div className="text-xs">
          {getVolumeChangeIndicator(item.washtrade_suspect_sales_change)}
        </div>
      </div>
    ),
    wallets: (
      <div>
        {item.washtrade_wallets || 0}
        <div className="text-xs">
          {getWalletChangeIndicator(item.washtrade_wallets_change)}
        </div>
      </div>
    )
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-4 space-y-6"
    >
      <BackButton />

      <FuturisticCard className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
          NFT Collection Wash Trading Analysis
        </h1>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by collection name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-gray-700/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <FuturisticSelect
            value={blockchainFilter}
            onChange={setBlockchainFilter}
            options={[
              { value: '', label: 'All Blockchains' },
              { value: 'ethereum', label: 'Ethereum' },
              { value: 'polygon', label: 'Polygon' }
            ]}
            placeholder="Select Blockchain"
          />
          <FuturisticSelect
            value={riskFilter}
            onChange={setRiskFilter}
            options={[
              { value: '', label: 'All Risk Levels' },
              { value: 'High Risk', label: 'High Risk' },
              { value: 'Medium Risk', label: 'Medium Risk' },
              { value: 'Low Risk', label: 'Low Risk' },
              { value: 'No Risk', label: 'No Risk' }
            ]}
            placeholder="Select Risk Level"
          />
        </div>

        {/* Top Collections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {topCollections.map((collection, index) => (
            <FuturisticCard
              key={index}
              className="p-4"
              gradient={`from-${index === 0 ? 'red' : index === 1 ? 'orange' : 'yellow'}-500/10 to-${index === 0 ? 'pink' : index === 1 ? 'red' : 'orange'}-500/10`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {collection.thumbnail_url && (
                  <img 
                    src={collection.thumbnail_url} 
                    alt={collection.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <h3 className="font-semibold">{collection.name}</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-80">
                  Volume: {formatVolume(collection.washtrade_volume)}
                  <span className="ml-2 text-xs">
                    {getVolumeChangeIndicator(collection.washtrade_volume_change)}
                  </span>
                </p>
                <p className="text-sm opacity-80">
                  Wash Trade Ratio: {(collection.washtrade_suspect_sales_ratio * 100).toFixed(4)}%
                </p>
                <div className="flex justify-between text-xs">
                  <span className={getRiskLevel(collection.washtrade_suspect_sales_ratio).color}>
                    {getRiskLevel(collection.washtrade_suspect_sales_ratio).text}
                  </span>
                  <span>
                    {collection.washtrade_wallets} wallets
                  </span>
                </div>
              </div>
            </FuturisticCard>
          ))}
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" color="primary" />
          </div>
        ) : (
          <FuturisticTable
            headers={headers}
            data={tableData}
            isLoading={loading}
            onRowClick={(row) => console.log('Clicked row:', row)}
          />
        )}
      </FuturisticCard>
    </motion.div>
  );
};

export default CollectionWashtrade;