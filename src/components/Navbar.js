import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">NFT Tracker</Link>
        <div className="flex space-x-4">
          <Link to="/collectionoverview" className="text-white hover:text-blue-400">NFT Collections</Link>
          <Link to="/nftmarketplaceoverview" className="text-white hover:text-blue-400">NFT Marketplace</Link>
        
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
