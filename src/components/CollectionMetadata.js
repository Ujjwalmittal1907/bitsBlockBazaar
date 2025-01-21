import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CollectionMetadata = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/collection/metadata?sort_order=desc&offset=0&limit=30', options)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 font-sans bg-gray-900 text-white min-h-screen">
      <button onClick={() => navigate('/collectionoverview')} className="mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back to Collection Overview
      </button>
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Collection Metadata</h1>
      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.filter(item => item.collection).map((item, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
              {item.image_url && <img src={item.image_url} alt="NFT" className="w-full h-48 object-cover rounded-lg mb-4" />}
              <h2 className="text-xl font-bold mb-2">{item.collection || item.contract_address}</h2>
              <p className="text-gray-400 mb-2">Blockchain: {item.blockchain || 'N/A'}</p>
              <p className="text-gray-400 mb-2">Category: {item.category || 'N/A'}</p>
              <p className="text-gray-400 mb-2">Contract Address: {item.contract_address}</p>
              <p className="text-gray-400 mb-2">Description: {item.description || 'N/A'}</p>
              <p className="text-gray-400 mb-2">Contract Type: {item.contract_type || 'N/A'}</p>
              <p className="text-gray-400 mb-2">Created Date: {item.contract_created_date || 'N/A'}</p>
              <a href={item.marketplace_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Marketplace</a>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CollectionMetadata;