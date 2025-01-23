import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FuturisticLoader, FuturisticCard, FuturisticButton } from './shared';
import BackButton from './BackButton';

const CollectionCategories = () => {
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    setIsLoading(true);
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
      .catch(err => console.error(err))
      .finally(() => {
        setIsLoading(false);
      });
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Loading Collection Categories..." />
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <BackButton />
      <FuturisticButton onClick={() => navigate('/collectionoverview')} className="mb-6">
        Back to Collection Overview
      </FuturisticButton>
      <h1 className={`text-4xl font-bold mb-6 text-center ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Collection Categories</h1>
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className={`p-2 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'} rounded`}
        />
      </div>
    
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item, index) => (
            <FuturisticCard key={index} className="p-4 rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105 relative group">
              <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{item.Name}</h2>
              <div className={`absolute inset-0 ${isDark ? 'bg-gray-900' : 'bg-gray-100'} bg-opacity-90 flex items-center justify-center text-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <div>
                  <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{item.Name}</h2>
                  <p className={`p-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.Description || 'N/A'}</p>
                </div>
              </div>
            </FuturisticCard>
          ))}
        </div>
      ) : (
        <p>No categories found.</p>
      )}
    </div>
  );
};

export default CollectionCategories;
