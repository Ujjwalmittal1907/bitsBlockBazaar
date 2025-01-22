import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

const CollectionWashtrade = () => {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/collection/washtrade?blockchain=ethereum&time_range=24h&offset=0&limit=30&sort_by=washtrade_assets&sort_order=desc', options)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setFilteredData(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const getSuggestions = (item) => {
    if (item.washtrade_assets_change > 0.5) {
      return { message: "Significant increase in washtrade assets. Investigate potential wash trading.", color: "text-red-500" };
    } else if (item.washtrade_assets_change > 0.2) {
      return { message: "Moderate increase in washtrade assets. Monitor closely.", color: "text-yellow-500" };
    } else {
      return { message: "Stable washtrade assets.", color: "text-green-500" };
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);

    if (value === 'all') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => {
        const suggestion = getSuggestions(item).message;
        if (value === 'significant' && suggestion.includes("Significant")) return true;
        if (value === 'moderate' && suggestion.includes("Moderate")) return true;
        if (value === 'stable' && suggestion.includes("Stable")) return true;
        return false;
      });
      setFilteredData(filtered);
    }
  };

  return (
    <div className="container mx-auto p-4 font-sans bg-gray-900 text-white min-h-screen">
      <BackButton />
      <button onClick={() => navigate('/collectionoverview')} className="mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back to Collection Overview
      </button>
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Collection Washtrade</h1>
      <div className="mb-6 text-center">
        <select
          className="p-2 bg-gray-800 text-white rounded"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="all">All</option>
          <option value="significant">Significant Increase</option>
          <option value="moderate">Moderate Increase</option>
          <option value="stable">Stable</option>
        </select>
      </div>
      {filteredData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-2">{item.contract_address}</h2>
              {item.blockchain && <p className="text-gray-400 mb-2">Blockchain: {item.blockchain}</p>}
              {item.washtrade_assets && <p className="text-gray-400 mb-2">Washtrade Assets: {item.washtrade_assets}</p>}
              {item.washtrade_suspect_sales && <p className="text-gray-400 mb-2">Suspect Sales: {item.washtrade_suspect_sales}</p>}
              {item.washtrade_volume && <p className="text-gray-400 mb-2">Washtrade Volume: {item.washtrade_volume}</p>}
              {item.washtrade_wallets && <p className="text-gray-400 mb-2">Washtrade Wallets: {item.washtrade_wallets}</p>}
              {item.updated_at && <p className="text-gray-400 mb-2">Updated At: {item.updated_at}</p>}
              <p className={`mt-4 ${getSuggestions(item).color}`}>{getSuggestions(item).message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CollectionWashtrade;