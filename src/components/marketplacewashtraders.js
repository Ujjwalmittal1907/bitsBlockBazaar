import React, { useState, useEffect } from 'react';

const NftMarketplaceWashTraders = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [blockchainFilter, setBlockchainFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': '3e736dba7151eb8de28a065916dc9d70' }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/marketplace/washtrade?blockchain=ethereum&time_range=24h&sort_by=name&sort_order=desc&offset=0&limit=30', options)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setFilteredData(res.data);
        const sortedData = res.data
          .filter(item => item.washtrade_suspect_sales_ratio !== null && item.washtrade_suspect_sales_ratio !== undefined)
          .sort((a, b) => b.washtrade_suspect_sales_ratio - a.washtrade_suspect_sales_ratio);
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
    if (item.washtrade_suspect_sales_ratio > 0.0001) {
      return { text: "High wash trading activity, consider monitoring closely.", color: "text-red-500" };
    } else if (item.washtrade_suspect_sales_ratio > 0.00005) {
      return { text: "Moderate wash trading activity, potential for growth.", color: "text-yellow-500" };
    } else if (item.washtrade_suspect_sales_ratio < 0) {
      return { text: "Declining wash trading activity, exercise caution.", color: "text-blue-500" };
    } else {
      return { text: "Stable wash trading activity.", color: "text-green-500" };
    }
  };

  const formatRatio = (ratio) => {
    return typeof ratio === 'number' ? ratio.toFixed(8) : 'N/A';
  };

  return (
    <div className="p-6 font-sans bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">NFT Marketplace Wash Traders</h1>
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
            <option value="High wash trading activity, consider monitoring closely.">High wash trading activity</option>
            <option value="Moderate wash trading activity, potential for growth.">Moderate wash trading activity</option>
            <option value="Declining wash trading activity, exercise caution.">Declining wash trading activity</option>
            <option value="Stable wash trading activity.">Stable wash trading activity</option>
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
                <p className="text-gray-400">Washtrade Suspect Sales Ratio: {formatRatio(item.washtrade_suspect_sales_ratio)}</p>
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
              <p className="text-gray-400">Washtrade Suspect Sales Ratio: {formatRatio(item.washtrade_suspect_sales_ratio)}</p>
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

export default NftMarketplaceWashTraders;