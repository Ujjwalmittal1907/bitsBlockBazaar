import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  FuturisticLoader, 
  FuturisticCard, 
  FuturisticTable,
  FuturisticButton 
} from './shared';
import BackButton from './BackButton';

const CollectionTraders = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const { isDark } = useTheme();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/collection/traders?blockchain=ethereum&offset=0&limit=30&sort_by=traders&time_range=24h&sort_order=desc', options)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getSuggestions = (item) => {
    if (item.traders_change > 0.5) {
      return { message: "Significant increase in traders. Consider investigating the cause.", color: "text-red-500" };
    } else if (item.traders_change > 0.2) {
      return { message: "Moderate increase in traders. Monitor the trend.", color: "text-yellow-500" };
    } else {
      return { message: "Stable trading activity.", color: "text-green-500" };
    }
  };

  const generateUseCase = (item) => {
    return (
      <FuturisticCard key={item.contract_address} className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">{item.contract_address}</h2>
        {item.blockchain && <p className="text-gray-400 mb-2">Blockchain: {item.blockchain}</p>}
        {item.traders && <p className="text-gray-400 mb-2">Traders: {item.traders}</p>}
        {item.traders_buyers && <p className="text-gray-400 mb-2">Buyers: {item.traders_buyers}</p>}
        {item.traders_sellers && <p className="text-gray-400 mb-2">Sellers: {item.traders_sellers}</p>}
        {item.updated_at && <p className="text-gray-400 mb-2">Updated At: {item.updated_at}</p>}
        <details className="mt-4">
          <summary className="text-blue-400 cursor-pointer">View Trends</summary>
          <div className="mt-2">
            <p className="text-gray-400 mb-2"><strong>Traders Trend:</strong> {item.traders_trend.join(', ')}</p>
            <p className="text-gray-400 mb-2"><strong>Buyers Trend:</strong> {item.traders_buyers_trend.join(', ')}</p>
            <p className="text-gray-400 mb-2"><strong>Sellers Trend:</strong> {item.traders_sellers_trend.join(', ')}</p>
          </div>
        </details>
        <p className={`mt-4 ${getSuggestions(item).color}`}>{getSuggestions(item).message}</p>
      </FuturisticCard>
    );
  };

  const filteredData = data ? data.filter(item => {
    const suggestion = getSuggestions(item).message;
    if (filter === 'all') return true;
    if (filter === 'significant' && suggestion.includes("Significant")) return true;
    if (filter === 'moderate' && suggestion.includes("Moderate")) return true;
    if (filter === 'stable' && suggestion.includes("Stable")) return true;
    return false;
  }) : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Loading Collection Traders..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <BackButton />
      <div className="p-6 font-sans bg-gray-900 text-white min-h-screen">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Collection Traders</h1>
        <div className="mb-6 text-center">
          <FuturisticButton className={`mx-2 px-4 py-2 ${filter === 'all' ? 'bg-blue-500' : 'bg-gray-700'}`} onClick={() => setFilter('all')}>All</FuturisticButton>
          <FuturisticButton className={`mx-2 px-4 py-2 ${filter === 'significant' ? 'bg-blue-500' : 'bg-gray-700'}`} onClick={() => setFilter('significant')}>Significant</FuturisticButton>
          <FuturisticButton className={`mx-2 px-4 py-2 ${filter === 'moderate' ? 'bg-blue-500' : 'bg-gray-700'}`} onClick={() => setFilter('moderate')}>Moderate</FuturisticButton>
          <FuturisticButton className={`mx-2 px-4 py-2 ${filter === 'stable' ? 'bg-blue-500' : 'bg-gray-700'}`} onClick={() => setFilter('stable')}>Stable</FuturisticButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map(item => generateUseCase(item))}
        </div>
      </div>
    </div>
  );
};

export default CollectionTraders;