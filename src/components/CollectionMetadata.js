import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FuturisticLoader, FuturisticCard, FuturisticInput } from './shared';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

const CollectionMetadata = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': process.env.REACT_APP_X_API_KEY }
    };

    const fetchMetadata = async () => {
      try {
        fetch('https://api.unleashnfts.com/api/v2/nft/collection/metadata?sort_order=desc&offset=0&limit=30', options)
          .then(res => res.json())
          .then(res => setData(res.data))
          .catch(err => console.error(err));
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FuturisticLoader size="large" text="Loading Collection Metadata..." />
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <BackButton />
      <div className={`p-6 font-sans ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'} min-h-screen`}>
        <button onClick={() => navigate('/collectionoverview')} className={`mb-6 ${isDark ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded`}>
          Back to Collection Overview
        </button>
        <h1 className={`text-4xl font-bold mb-6 text-center ${isDark ? 'text-blue-400' : 'text-blue-400'}`}>Collection Metadata</h1>
        {data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.filter(item => item.collection).map((item, index) => (
              <div key={index} className={`bg-gray-800 p-4 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                {item.image_url && <img src={item.image_url} alt="NFT" className="w-full h-48 object-cover rounded-lg mb-4" />}
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{item.collection || item.contract_address}</h2>
                <p className={`text-gray-400 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Blockchain: {item.blockchain || 'N/A'}</p>
                <p className={`text-gray-400 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Category: {item.category || 'N/A'}</p>
                <p className={`text-gray-400 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contract Address: {item.contract_address}</p>
                <p className={`text-gray-400 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Description: {item.description || 'N/A'}</p>
                <p className={`text-gray-400 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contract Type: {item.contract_type || 'N/A'}</p>
                <p className={`text-gray-400 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Created Date: {item.contract_created_date || 'N/A'}</p>
                <a href={item.marketplace_url} target="_blank" rel="noopener noreferrer" className={`text-blue-400 hover:underline ${isDark ? 'text-blue-400' : 'text-blue-400'}`}>Marketplace</a>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default CollectionMetadata;