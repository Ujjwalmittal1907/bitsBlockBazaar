import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from './Loader';

const NftMarketplaceOverview = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 font-sans bg-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-fade-in">
          NFT Marketplace
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            to="/nftmarketplace" 
            className="group bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-blue-400 transition-colors">NFT Marketplace Metadata</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">View comprehensive metadata for the NFT marketplace.</p>
          </Link>

          <Link 
            to="/nftmarketplaceholders" 
            className="group bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-purple-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-purple-400 transition-colors">NFT Marketplace Holders</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">View detailed analytics about NFT marketplace holders.</p>
          </Link>

          <Link 
            to="/marketplacetraders" 
            className="group bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-green-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-green-400 transition-colors">NFT Marketplace Traders</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">Track and analyze NFT marketplace trading activities.</p>
          </Link>

          <Link 
            to="/marketplacewashtraders" 
            className="group bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-red-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-500 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-red-400 transition-colors">NFT Marketplace Wash Traders</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">Monitor and identify potential wash trading activities.</p>
          </Link>

          <Link 
            to="/marketplaceanalytics" 
            className="group bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-yellow-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-500 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-yellow-400 transition-colors">NFT Marketplace Analytics</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">Access comprehensive analytics and insights.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NftMarketplaceOverview;
