import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

const CollectionScores = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // New state for filter
  const navigate = useNavigate();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/collection/scores?sort_by=market_cap', options)
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
    if (item.price_avg_change > 0.5) {
      return { message: "Significant increase in average price. Consider investigating the cause.", color: "text-red-500" };
    } else if (item.price_avg_change > 0.2) {
      return { message: "Moderate increase in average price. Monitor the trend.", color: "text-yellow-500" };
    } else {
      return { message: "Stable average price.", color: "text-green-500" };
    }
  };

  const generateUseCase = (item) => {
    return (
      <div key={item.contract_address} className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">{item.contract_address}</h2>
        {item.blockchain && <p className="text-gray-400 mb-2">Blockchain: {item.blockchain}</p>}
        {item.market_cap && <p className="text-gray-400 mb-2">Market Cap: {item.market_cap}</p>}
        {item.price_avg && <p className="text-gray-400 mb-2">Price Avg: {item.price_avg}</p>}
        {item.price_ceiling && <p className="text-gray-400 mb-2">Price Ceiling: {item.price_ceiling}</p>}
        {item.royalty_price && <p className="text-gray-400 mb-2">Royalty Price: {item.royalty_price}</p>}
        <details className="mt-4">
          <summary className="text-blue-400 cursor-pointer">View Trends</summary>
          <div className="mt-2">
            <p className="text-gray-400 mb-2"><strong>Market Cap Trend:</strong> {item.marketcap_trend}</p>
            <p className="text-gray-400 mb-2"><strong>Price Avg Trend:</strong> {item.price_avg_trend}</p>
            <p className="text-gray-400 mb-2"><strong>Price Ceiling Trend:</strong> {item.price_ceiling_trend}</p>
          </div>
        </details>
        <p className={`mt-4 ${getSuggestions(item).color}`}>{getSuggestions(item).message}</p>
      </div>
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

  return (
    <div className="container mx-auto p-4">
      <BackButton />
      <button
        onClick={() => navigate('/collectionoverview')}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Back to Collection Overview
      </button>
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Collection Scores</h1>
      <div className="mb-6 text-center">
        <button className={`mx-2 px-4 py-2 ${filter === 'all' ? 'bg-blue-500' : 'bg-gray-700'}`} onClick={() => setFilter('all')}>All</button>
        <button className={`mx-2 px-4 py-2 ${filter === 'significant' ? 'bg-blue-500' : 'bg-gray-700'}`} onClick={() => setFilter('significant')}>Significant</button>
        <button className={`mx-2 px-4 py-2 ${filter === 'moderate' ? 'bg-blue-500' : 'bg-gray-700'}`} onClick={() => setFilter('moderate')}>Moderate</button>
        <button className={`mx-2 px-4 py-2 ${filter === 'stable' ? 'bg-blue-500' : 'bg-gray-700'}`} onClick={() => setFilter('stable')}>Stable</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map(item => generateUseCase(item))}
        </div>
      )}
    </div>
  );
};

export default CollectionScores;