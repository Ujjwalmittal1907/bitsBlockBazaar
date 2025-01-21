import React from 'react';
import { Link } from 'react-router-dom';

const CollectionOverview = () => {
  return (
    <div className="p-6 font-sans bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Collection Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/collectionmetadata" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">Collection Metadata</h2>
          <p className="text-gray-400">View metadata for collections.</p>
        </Link>
        <Link to="/collectionanalytics" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">Collection Analytics</h2>
          <p className="text-gray-400">View analytics for collections.</p>
        </Link>
        <Link to="/collectionscores" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">Collection Scores</h2>
          <p className="text-gray-400">View scores and analytics for collections.</p>
        </Link>
        <Link to="/collectionholders" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">Collection Holders</h2>
          <p className="text-gray-400">View details about collection holders.</p>
        </Link>
        <Link to="/collectionwashtrade" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">Collection Washtrade</h2>
          <p className="text-gray-400">View washtrade data for collections.</p>
        </Link>
        <Link to="/collectioncategories" className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300">
          <h2 className="text-xl font-bold mb-2 text-white">Collection Categories</h2>
          <p className="text-gray-400">View categories for collections.</p>
        </Link>
      </div>
    </div>
  );
};

export default CollectionOverview;
