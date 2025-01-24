import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FuturisticLoader } from './shared';
import BackButton from './BackButton';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';

const CollectionCategories = () => {
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <FuturisticLoader size="large" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
        >
          Loading Collection Categories...
        </motion.p>
      </div>
    );
  }

  const CategoryCard = ({ item }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedCategory(selectedCategory === item ? null : item)}
      className={`${
        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300`}
    >
      <div className="p-6">
        <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          {item.Name}
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
          {item.Description || 'No description available'}
        </p>
        
        <AnimatePresence>
          {selectedCategory === item && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="mb-2">
                  <span className="font-semibold">Total Collections:</span> {item.TotalCollections || 0}
                </p>
                <p className="mb-2">
                  <span className="font-semibold">Average Market Cap:</span> ${item.AverageMarketCap?.toLocaleString() || 0}
                </p>
                <p>
                  <span className="font-semibold">Growth Rate:</span> {item.GrowthRate || '0%'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiList size={20} />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className={`text-4xl font-bold text-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Collection Categories
          </h1>
          <div className="max-w-md mx-auto relative">
            <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearch}
              className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none ${
                isDark
                  ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
                  : 'bg-white text-gray-900 placeholder-gray-400 border-gray-200'
              } border focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
            />
          </div>
        </div>

        <AnimatePresence>
          {filteredData.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-6 ${
                viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
              }`}
            >
              {filteredData.map((item, index) => (
                <CategoryCard key={index} item={item} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No categories found matching your search.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CollectionCategories;
