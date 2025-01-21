import React from 'react';
import { useNavigate } from 'react-router-dom';

const NftCollection = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 font-sans bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">NFT Collection</h1>
      <div className="flex flex-col items-center space-y-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => navigate('/collectionmetadata')}
        >
          Collection Metadata
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => navigate('/collectionanalytics')}
        >
          Collection Analytics
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => navigate('/collectionholders')}
        >
          Collection Holders
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => navigate('/collectionscores')}
        >
          Collection Scores
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => navigate('/collectiontraders')}
        >
          Collection Traders
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => navigate('/collectionwashtrade')}
        >
          Collection Washtrade
        </button>
       
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => navigate('/collectioncategories')}
        >
          Collection Categories
        </button>
      </div>
    </div>
  );
};

export default NftCollection;
