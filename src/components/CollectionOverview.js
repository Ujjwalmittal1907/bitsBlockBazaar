import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from './Loader';

const CollectionOverview = () => {
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600 animate-fade-in">
            Collection Overview
          </h1>
          <p className="text-gray-400 text-lg animate-fade-in">Explore and analyze your NFT collections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Collection Metadata */}
          <Link 
            to="/collectionmetadata" 
            className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-indigo-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-500/80 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-indigo-400 transition-colors">Collection Metadata</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">Comprehensive metadata and details for your NFT collections.</p>
          </Link>

          {/* Collection Analytics */}
          <Link 
            to="/collectionanalytics" 
            className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-500/80 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-blue-400 transition-colors">Collection Analytics</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">In-depth analytics and insights for your collections.</p>
          </Link>

          {/* Collection Scores */}
          <Link 
            to="/collectionscores" 
            className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-green-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-500/80 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-green-400 transition-colors">Collection Scores</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">Performance scores and ranking analytics.</p>
          </Link>

          {/* Collection Holders */}
          <Link 
            to="/collectionholders" 
            className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-purple-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-500/80 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-purple-400 transition-colors">Collection Holders</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">Detailed insights about collection holders and ownership.</p>
          </Link>

          {/* Collection Washtrade */}
          <Link 
            to="/collectionwashtrade" 
            className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-red-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-500/80 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-red-400 transition-colors">Collection Washtrade</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">Monitor and analyze potential wash trading activities.</p>
          </Link>

          {/* Collection Categories */}
          <Link 
            to="/collectioncategories" 
            className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border border-transparent hover:border-yellow-500"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-yellow-500/80 rounded-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold ml-3 text-white group-hover:text-yellow-400 transition-colors">Collection Categories</h2>
            </div>
            <p className="text-gray-400 group-hover:text-gray-300">Browse and filter collections by categories.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollectionOverview;
