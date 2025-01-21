import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { isDark } = useTheme();

  const sections = [
    {
      title: 'NFT Collection',
      description: 'Discover unique NFT collections and track their performance',
      link: '/collectionoverview',
      analyticsLink: '/collectionanalytics',
      icon: '🖼️',
      gradient: 'gradient-green'
    },
    {
      title: 'NFT Marketplace',
      description: 'Explore the latest trends in NFT marketplaces',
      link: '/nftmarketplaceoverview',
      analyticsLink: '/nftmarketplaceanalytics',
      icon: '🏪',
      gradient: 'gradient-blue'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold gradient-text gradient-blue animate-fade-in mb-4">
          NFT Analytics Dashboard
        </h1>
        <p className={`text-lg md:text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Your comprehensive platform for NFT collection and marketplace analytics
        </p>
      </section>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {sections.map((section, index) => (
          <div key={index} className="space-y-6">
            {/* Main Section Card */}
            <Link 
              to={section.link}
              className={`block card glass-effect p-6 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} 
                transform transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{section.icon}</span>
                <div>
                  <h2 className={`text-2xl font-bold gradient-text ${section.gradient}`}>
                    {section.title}
                  </h2>
                  <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {section.description}
                  </p>
                </div>
              </div>
              <div className={`mt-4 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} flex items-center`}>
                Explore {section.title} →
              </div>
            </Link>

            {/* Analytics Card */}
            <Link 
              to={section.analyticsLink}
              className={`block card glass-effect p-6 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} 
                transform transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="flex items-center space-x-4">
                <span className="text-4xl">📊</span>
                <div>
                  <h2 className={`text-2xl font-bold gradient-text ${section.gradient}`}>
                    {section.title} Analytics
                  </h2>
                  <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Deep dive into {section.title.toLowerCase()} statistics and trends
                  </p>
                </div>
              </div>
              <div className={`mt-4 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} flex items-center`}>
                View Analytics →
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/collectionoverview" className="btn btn-primary">
            Collection Overview
          </Link>
          <Link to="/collectionanalytics" className="btn btn-secondary">
            Collection Analytics
          </Link>
          <Link to="/nftmarketplaceoverview" className="btn btn-primary">
            Marketplace Overview
          </Link>
          <Link to="/nftmarketplaceanalytics" className="btn btn-secondary">
            Marketplace Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;