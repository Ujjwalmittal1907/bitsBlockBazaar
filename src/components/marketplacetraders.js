import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';

const NftMarketplaceTraders = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [blockchainFilter, setBlockchainFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/marketplace/traders?blockchain=ethereum&time_range=24h&sort_by=name&sort_order=desc&offset=0&limit=30', options)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setFilteredData(res.data);
        const sortedData = res.data
          .filter(item => item.traders_change !== null && item.traders_change !== undefined)
          .sort((a, b) => b.traders_change - a.traders_change);
        setSuggestions(sortedData.slice(0, 3));
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let filtered = data;
    if (blockchainFilter) {
      filtered = filtered.filter(item => item.blockchain === blockchainFilter);
    }
    if (nameFilter) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (suggestionFilter) {
      filtered = filtered.filter(item => getSuggestion(item).text === suggestionFilter);
    }
    setFilteredData(filtered);
  }, [blockchainFilter, nameFilter, suggestionFilter, data]);

  const getSuggestion = (item) => {
    if (item.traders_change > 50) {
      return { text: "High trading activity, consider monitoring closely.", color: "text-red-500" };
    } else if (item.traders_change > 20) {
      return { text: "Moderate trading activity, potential for growth.", color: "text-yellow-500" };
    } else if (item.traders_change < 0) {
      return { text: "Declining trading activity, exercise caution.", color: "text-blue-500" };
    } else {
      return { text: "Stable trading activity.", color: "text-green-500" };
    }
  };

  return (
    <div className="container mx-auto p-4">
      <BackButton />
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">NFT Marketplace Traders</h1>
      <div className="mb-4 flex justify-between">
        <div className="w-1/3 pr-2">
          <label className="block mb-2">Filter by Blockchain:</label>
          <select
            className="bg-gray-800 p-2 rounded w-full"
            value={blockchainFilter}
            onChange={(e) => setBlockchainFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
            <option value="avalanche">Avalanche</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>
        <div className="w-1/3 px-2">
          <label className="block mb-2">Filter by Name:</label>
          <input
            type="text"
            className="bg-gray-800 p-2 rounded w-full"
            placeholder="Enter name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
        </div>
        <div className="w-1/3 pl-2">
          <label className="block mb-2">Filter by Suggestion:</label>
          <select
            className="bg-gray-800 p-2 rounded w-full"
            value={suggestionFilter}
            onChange={(e) => setSuggestionFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="High trading activity, consider monitoring closely.">High trading activity</option>
            <option value="Moderate trading activity, potential for growth.">Moderate trading activity</option>
            <option value="Declining trading activity, exercise caution.">Declining trading activity</option>
            <option value="Stable trading activity.">Stable trading activity</option>
          </select>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Top Suggestions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((item, index) => {
            const suggestion = getSuggestion(item);
            return (
              <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
                <h2 className="text-xl font-bold mb-2 text-white">{item.name}</h2>
                <p className="text-gray-400">Blockchain: {item.blockchain}</p>
                <p className="text-gray-400">Traders: {item.traders}</p>
                <p className="text-gray-400">Traders Change: {item.traders_change ? item.traders_change.toFixed(2) + '%' : 'N/A'}</p>
                <p className={`text-gray-400 ${suggestion.color}`}>Suggestion: {suggestion.text}</p>
                {item.url && (
                  <p className="text-gray-400">
                    URL: <a href={item.url} className="text-blue-400" target="_blank" rel="noopener noreferrer">{item.url}</a>
                  </p>
                )}
                {item.thumbnail_url && (
                  <img src={item.thumbnail_url} alt={item.name} className="mt-4 rounded" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item, index) => {
          const suggestion = getSuggestion(item);
          return (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
              <h2 className="text-xl font-bold mb-2 text-white">{item.name}</h2>
              <p className="text-gray-400">Blockchain: {item.blockchain}</p>
              <p className="text-gray-400">Traders: {item.traders}</p>
              <p className="text-gray-400">Traders Change: {item.traders_change ? item.traders_change.toFixed(2) + '%' : 'N/A'}</p>
              <p className={`text-gray-400 ${suggestion.color}`}>Suggestion: {suggestion.text}</p>
              {item.url && (
                <p className="text-gray-400">
                  URL: <a href={item.url} className="text-blue-400" target="_blank" rel="noopener noreferrer">{item.url}</a>
                </p>
              )}
              {item.thumbnail_url && (
                <img src={item.thumbnail_url} alt={item.name} className="mt-4 rounded" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NftMarketplaceTraders;