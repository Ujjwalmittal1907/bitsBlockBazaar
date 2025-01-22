import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

const CollectionCategories = () => {
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    

    const options = {
      method: 'GET',
      headers: { 
        accept: 'application/json', 
        'x-api-key': process.env.REACT_APP_X_API_KEY 
      }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/collection/categories?offset=0&limit=30&sort_order=desc', options)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = data
    ? data.filter(item => 
        item.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.Description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="container mx-auto p-4">
      <BackButton />
      <button onClick={() => navigate('/collectionoverview')} className="mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back to Collection Overview
      </button>
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Collection Categories</h1>
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 bg-gray-800 text-white rounded"
        />
      </div>
    
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105 relative group">
              <h2 className="text-xl font-bold mb-2 text-blue-400">{item.Name}</h2>
              <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div>
                  <h2 className="text-xl font-bold mb-2 text-blue-400">{item.Name}</h2>
                  <p className="p-4">{item.Description || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No categories found.</p>
      )}
    </div>
  );
};

export default CollectionCategories;
