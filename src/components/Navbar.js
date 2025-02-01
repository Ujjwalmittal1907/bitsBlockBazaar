import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaStar } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  const navItems = [
    { path: '/', label: 'Home' },
    {
      path: '#',
      label: 'Web3 Watch',
      gradient: 'from-blue-600 to-indigo-600',
      subItems: [
        { path: '/nftmarketanalyticsreport', label: 'Blockchain Asset Report', highlight: true },
        { path: '/nftwashtradeinsights', label: 'NFT Market Anomalies', highlight: true },
        { path: '/nftscoresinsights', label: 'Token Trust Scores' },
        { path: '/nfttradersinsights', label: 'NFT Traders Insights' }
      ]
    },
    {
      path: '#',
      label: 'BlockBazaar',
      gradient: 'from-indigo-600 to-purple-600',
      subItems: [
        { path: '/nftmarketplace', label: 'NFT Marketplaces' },
        { path: '/marketplaceanalytics', label: 'NFT Marketplace Analytics', highlight: true },
        { path: '/marketplacewashtraders', label: 'Marketplace Wash Trading Analysis', highlight: true },
        { path: '/marketplacetraders', label: 'Marketplace Traders Analysis' }
      ]
    },
    {
      path: '#',
      label: 'CryptoCanvas',
      gradient: 'from-purple-600 to-pink-600',
      subItems: [
        { path: '/collectionmetadata', label: 'NFT Collection Metadata' },
        { path: '/collectionanalytics', label: 'Collection Analytics Overview', highlight: true },
        { path: '/collectionwashtrade', label: 'Collection Wash Trade Analysis', highlight: true },
        { path: '/collectiontraders', label: 'Collection Traders Analysis' },
        { path: '/collectionscores', label: 'Collection Score Analysis' },
        { path: '/collectioncategories', label: 'Collection Category Analysis' }
      ]
    }
  ];

  return (
    <nav ref={navRef} className={`sticky top-0 z-50 transition-all duration-300
      ${isDark ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-lg
      border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" className={`${isDark ? 'fill-blue-500' : 'fill-blue-600'}`}/>
                <path d="M8 8H24V24H8V8Z" className={`${isDark ? 'fill-blue-700' : 'fill-blue-800'}`}/>
                <path d="M12 12L20 12L16 8L12 12Z" fill="white"/>
                <path d="M20 20H12L16 24L20 20Z" fill="white"/>
                <path d="M12 12V20L8 16L12 12Z" className={`${isDark ? 'fill-blue-300' : 'fill-blue-200'}`}/>
                <path d="M20 20V12L24 16L20 20Z" className={`${isDark ? 'fill-blue-300' : 'fill-blue-200'}`}/>
                <circle cx="16" cy="16" r="3" fill="white"/>
              </svg>
              <span className={`ml-2 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                NFT Insights
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item, index) => (
                <div key={index} className="relative group">
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(index)}
                        className={`px-3 py-2 rounded-md text-sm font-medium
                          ${isDark ? 'hover:text-white' : 'hover:text-gray-900'}
                          ${openSubmenu === index 
                            ? `bg-gradient-to-r ${item.gradient} text-white` 
                            : isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        {item.label}
                      </button>
                      {openSubmenu === index && (
                        <div className={`absolute left-0 mt-2 w-64 rounded-md shadow-lg
                          ${isDark ? 'bg-gray-800' : 'bg-white'}
                          ring-1 ring-black ring-opacity-5`}>
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {item.subItems.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                to={subItem.path}
                                className={`block px-4 py-2 text-sm transition-colors duration-200
                                  ${isDark 
                                    ? subItem.highlight
                                      ? 'text-white bg-gray-700 hover:bg-gray-600' 
                                      : 'text-gray-300 hover:bg-gray-700'
                                    : subItem.highlight
                                      ? 'text-gray-900 bg-gray-100 hover:bg-gray-200'
                                      : 'text-gray-700 hover:bg-gray-100'
                                  }
                                  ${isActive(subItem.path) ? `bg-gradient-to-r ${item.gradient} text-white` : ''}`}
                                role="menuitem"
                                onClick={() => setOpenSubmenu(null)}
                              >
                                <div className="flex items-center">
                                  {subItem.label}
                                  {subItem.highlight && (
                                    <FaStar className="ml-2 text-yellow-500 w-3 h-3" />
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium
                        ${isActive(item.path)
                          ? 'bg-blue-500 text-white'
                          : isDark
                            ? 'text-gray-300 hover:text-white'
                            : 'text-gray-700 hover:text-gray-900'}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
          </button>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md 
                ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white`}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {navItems.map((item, index) => (
            <div key={index}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className={`w-full text-left px-3 py-2 rounded-md text-base font-medium
                      ${openSubmenu === index 
                        ? `bg-gradient-to-r ${item.gradient} text-white`
                        : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    {item.label}
                  </button>
                  {openSubmenu === index && (
                    <div className="pl-4 space-y-1">
                      {item.subItems.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                            ${isDark 
                              ? subItem.highlight
                                ? 'text-white bg-gray-700 hover:bg-gray-600' 
                                : 'text-gray-300 hover:bg-gray-700'
                              : subItem.highlight
                                ? 'text-gray-900 bg-gray-100 hover:bg-gray-200'
                                : 'text-gray-700 hover:bg-gray-100'
                            }
                            ${isActive(subItem.path) ? `bg-gradient-to-r ${item.gradient} text-white` : ''}`}
                          onClick={() => {
                            setIsOpen(false);
                            setOpenSubmenu(null);
                          }}
                        >
                          <div className="flex items-center">
                            {subItem.label}
                            {subItem.highlight && (
                              <FaStar className="ml-2 text-yellow-500 w-3 h-3" />
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium
                    ${isActive(item.path)
                      ? 'bg-zinc-500 text-white'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-900 hover:bg-gray-100'}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
