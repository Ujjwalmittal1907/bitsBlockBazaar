import React, { useState, useEffect } from 'react';

const NftMarketplace = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [blockchainFilter, setBlockchainFilter] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('');

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': '3e736dba7151eb8de28a065916dc9d70' }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/marketplace/metadata?sort_order=desc&offset=0&limit=30', options)
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setFilteredData(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let filtered = data;
    if (blockchainFilter) {
      filtered = filtered.filter(item => item.blockchain === blockchainFilter);
    }
    if (marketplaceFilter) {
      filtered = filtered.filter(item => item.marketplaces === marketplaceFilter);
    }
    setFilteredData(filtered);
  }, [blockchainFilter, marketplaceFilter, data]);

  return (
    <div className="p-6 font-sans bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">NFT Marketplace Data</h1>
      <div className="mb-4">
        <label className="block mb-2">Filter by Blockchain:</label>
        <select
          className="bg-gray-800 p-2 rounded"
          value={blockchainFilter}
          onChange={(e) => setBlockchainFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="solana">Solana</option>
          <option value="ethereum">Ethereum</option>
          <option value="avalanche">Avalanche</option>
          <option value="polygon">Polygon</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Filter by Marketplace:</label>
        <select
          className="bg-gray-800 p-2 rounded"
          value={marketplaceFilter}
          onChange={(e) => setMarketplaceFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="ZetaDex">ZetaDex</option>
          <option value="x2y2 marketplace">x2y2 marketplace</option>
          <option value="Vending Machines Tycoon">Vending Machines Tycoon</option>
          <option value="treasureland">treasureland</option>
          <option value="tofuNFT">tofuNFT</option>
          <option value="The owners club">The owners club</option>
          <option value="TensorSwap">TensorSwap</option>
          <option value="superrare">superrare</option>
          <option value="sorare">sorare</option>
          <option value="SolSea">SolSea</option>
          <option value="Solanart">Solanart</option>
          <option value="SniperMarket">SniperMarket</option>
          <option value="snailTrail">snailTrail</option>
          <option value="sandbox">sandbox</option>
          <option value="Roostr">Roostr</option>
          <option value="rarible">rarible</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-white">{item.marketplaces}</h2>
            <p className="text-gray-400">Blockchain: {item.blockchain}</p>
            <p className="text-gray-400">Contract Address: {item.contract_address}</p>
            {item.external_url && (
              <p className="text-gray-400">
                External URL: <a href={item.external_url} className="text-blue-400" target="_blank" rel="noopener noreferrer">{item.external_url}</a>
              </p>
            )}
            {item.image_url && (
              <img src={item.image_url} alt={item.marketplaces} className="mt-4 rounded" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NftMarketplace;
