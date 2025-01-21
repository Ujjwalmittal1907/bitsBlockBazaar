import React from 'react';
import { Link } from 'react-router-dom';

const NftMarketplaceOverview = () => {
  return (
    <div className="p-6 font-sans bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">NFT Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/nftmarketplace" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">NFT Marketplace Metadata</h2>
          <p className="text-gray-400">View metadata for the NFT marketplace.</p>
        </Link>
        <Link to="/nftmarketplaceholders" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">NFT Marketplace Holders</h2>
          <p className="text-gray-400">View details about NFT marketplace holders.</p>
        </Link>
        <Link to="/marketplacetraders" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">NFT Marketplace Traders</h2>
          <p className="text-gray-400">View details about NFT marketplace traders.</p>
        </Link>
        <Link to="/marketplacewashtraders" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">NFT Marketplace Wash Traders</h2>
          <p className="text-gray-400">View details about NFT marketplace wash traders.</p>
        </Link>
        <Link to="/marketplaceanalytics" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">NFT Marketplace Analytics</h2>
          <p className="text-gray-400">View analytics for the NFT marketplace.</p>
        </Link>
      </div>
    </div>
  );
};

export default NftMarketplaceOverview;
