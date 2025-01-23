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
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [blockchainFilter, setBlockchainFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          'https://api.unleashnfts.com/api/v2/nft/collection/washtrade?blockchain=ethereum&time_range=24h&sort_by=washtrade_volume&sort_order=desc&offset=0&limit=30',
          {
            headers: {
              'x-api-key': process.env.REACT_APP_X_API_KEY,
              'accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Wash Trade API Response:', result);

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Invalid data format received from wash trade API');
        }

        // Process wash trade data first
        const washTradeData = result.data.map(item => {
          const washtrade_assets = parseInt(item.washtrade_assets) || 0;
          const washtrade_suspect_sales = parseInt(item.washtrade_suspect_sales) || 0;
          const washtrade_volume = parseFloat(item.washtrade_volume) || 0;
          const wash_trade_ratio = washtrade_assets > 0 ? (washtrade_suspect_sales / washtrade_assets) : 0;

          return {
            contract_address: item.contract_address,
            washtrade_volume,
            washtrade_volume_change: parseFloat(item.washtrade_volume_change) || 0,
            washtrade_suspect_sales,
            washtrade_assets,
            washtrade_wallets: parseInt(item.washtrade_wallets) || 0,
            washtrade_wallets_change: parseFloat(item.washtrade_wallets_change) || 0,
            wash_trade_ratio,
            blockchain: item.blockchain || 'ethereum'
          };
        });

        // Sort data by wash trade volume in descending order
        washTradeData.sort((a, b) => b.washtrade_volume - a.washtrade_volume);

        // Fetch metadata for each collection
        const collectionsWithMetadata = await Promise.all(
          washTradeData.map(async (item) => {
            try {
              const metadataResponse = await fetch(
                `https://api.unleashnfts.com/api/v2/nft/collection/metadata?blockchain=ethereum&contract_address=${item.contract_address}`,
                {
                  headers: {
                    'x-api-key': process.env.REACT_APP_X_API_KEY,
                    'accept': 'application/json'
                  }
                }
              );

              if (!metadataResponse.ok) {
                console.warn(`Metadata fetch failed for ${item.contract_address}`);
                return {
                  ...item,
                  name: `Collection ${item.contract_address.slice(0, 6)}...`,
                  thumbnail_url: null,
                };
              }

              const metadata = await metadataResponse.json();
              
              if (!metadata.data) {
                console.warn(`Invalid metadata format for ${item.contract_address}`);
                return {
                  ...item,
                  name: `Collection ${item.contract_address.slice(0, 6)}...`,
                  thumbnail_url: null,
                };
              }

              return {
                ...item,
                name: metadata.data.name || `Collection ${item.contract_address.slice(0, 6)}...`,
                thumbnail_url: metadata.data.image_url || null,
              };
            } catch (error) {
              console.error(`Error fetching metadata for ${item.contract_address}:`, error);
              return {
                ...item,
                name: `Collection ${item.contract_address.slice(0, 6)}...`,
                thumbnail_url: null,
              };
            }
          })
        );

        setData(collectionsWithMetadata);
        setFilteredData(collectionsWithMetadata);
      } catch (error) {
        console.error('Error in data fetching:', error);
        setError(error.message);
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data || !Array.isArray(data)) return;
    
    const filtered = data.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const blockchainMatch = !blockchainFilter || item.blockchain === blockchainFilter;
      const risk = getRiskLevel(item.wash_trade_ratio);
      const riskMatch = !riskFilter || risk.text === riskFilter;
      return nameMatch && blockchainMatch && riskMatch;
    });
    setFilteredData(filtered);
  }, [searchTerm, blockchainFilter, riskFilter, data]);

  const getRiskLevel = (ratio) => {
    if (typeof ratio !== 'number' || isNaN(ratio)) return { text: 'No Risk', color: 'text-green-500' };
    if (ratio >= 0.5) return { text: 'High Risk', color: 'text-red-500' };
    if (ratio >= 0.25) return { text: 'Medium Risk', color: 'text-orange-500' };
    if (ratio > 0) return { text: 'Low Risk', color: 'text-yellow-500' };
    return { text: 'No Risk', color: 'text-green-500' };
  };

  const formatVolume = (volume) => {
    if (typeof volume !== 'number' || isNaN(volume)) return '$0';
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

  const getTopCollections = () => {
    return filteredData
      .sort((a, b) => b.washtrade_volume - a.washtrade_volume)
      .slice(0, 3)
      .map(collection => ({
        name: collection.name,
        volume: formatVolume(collection.washtrade_volume),
        ratio: (collection.wash_trade_ratio * 100).toFixed(2),
        risk: getRiskLevel(collection.wash_trade_ratio).text
      }));
  };

  const tableData = filteredData.map(item => ({
    collection: (
      <div className="flex items-center space-x-2">
        {item.thumbnail_url && (
          <img 
            src={item.thumbnail_url} 
            alt={item.name || `Collection ${item.contract_address.slice(0, 6)}...`} 
            className="w-6 h-6 rounded-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        )}
        <div>
          <p className="font-medium">{item.name || `Collection ${item.contract_address.slice(0, 6)}...`}</p>
          <p className="text-xs text-gray-500">{item.contract_address}</p>
        </div>
      </div>
    ),
    volume: (
      <div>
        <p>{formatVolume(item.washtrade_volume)}</p>
        {getVolumeChangeIndicator(item.washtrade_volume_change)}
      </div>
    ),
    washTradeRatio: (
      <div>
        <p>{(item.wash_trade_ratio * 100).toFixed(2)}%</p>
        {getWalletChangeIndicator(item.washtrade_suspect_sales_change)}
      </div>
    ),
    riskLevel: (
      <div className={getRiskLevel(item.wash_trade_ratio).color}>
        {getRiskLevel(item.wash_trade_ratio).text}
      </div>
    ),
    suspectSales: (
      <div>
        {item.washtrade_suspect_sales}
        <span className="text-gray-500 text-sm"> of {item.washtrade_assets} total</span>
      </div>
    ),
    suspectWallets: item.washtrade_wallets
  }));

  const headers = [
    'Collection',
    'Wash Trade Volume (24h)',
    'Wash Trade Ratio',
    'Risk Level',
    'Suspect Sales',
    'Suspect Wallets'
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <BackButton />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <BackButton />
        <div className="text-center text-red-500 p-4 rounded-lg bg-red-100 dark:bg-red-900/20">
          <p className="font-semibold">{error}</p>
          <p className="text-sm mt-2">Please make sure your API key is correctly configured.</p>
        </div>
      </div>
    );
  }

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
          {getTopCollections().map((collection, index) => (
            <FuturisticCard
              key={index}
              className="p-4"
              gradient={`from-${index === 0 ? 'red' : index === 1 ? 'orange' : 'yellow'}-500/10 to-${index === 0 ? 'pink' : index === 1 ? 'red' : 'orange'}-500/10`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {collection.thumbnail && (
                  <img 
                    src={collection.thumbnail} 
                    alt={collection.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <h3 className="font-semibold">{collection.name}</h3>
              </div>
              <div className="space-y-1">
                <p className="text-sm opacity-80">
                  Volume: {collection.volume}
                  <span className="ml-2 text-xs">
                    {getVolumeChangeIndicator(collection.change)}
                  </span>
                </p>
                <p className="text-sm opacity-80">
                  Wash Trade Ratio: {collection.ratio}%
                </p>
                <div className="flex justify-between text-xs">
                  <span className={getRiskLevel(collection.ratio / 100).color}>
                    {collection.risk}
                  </span>
                  <span>
                    {collection.ratio}%
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