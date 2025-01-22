import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import NFTOverview from './components/NFTOverview';

// Market Insights Components
import NFTMarketAnalytics from './components/nft/nftmarketanalyticsreport';
import NFTScoresInsights from './components/nft/NftscoreresInsights';
import NFTHoldersInsights from './components/nft/NFTholdersinsights';
import NFTTradersInsights from './components/nft/nfttradersinsights';
import NFTWashTradeInsights from './components/nft/nftwashtradeinsights';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300 dark:bg-gray-900 bg-gray-50 dark:text-white text-gray-900">
          <Navbar />
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <main className="container mx-auto px-4 py-8 pt-20">
            <Routes>
              <Route path="/" element={<NFTOverview />} />
              
              {/* Market Insights Routes */}
              <Route path="/nft-market-analytics" element={<NFTMarketAnalytics />} />
              <Route path="/nft-score-insights" element={<NFTScoresInsights />} />
              <Route path="/nft-holders-insights" element={<NFTHoldersInsights />} />
              <Route path="/nft-traders-insights" element={<NFTTradersInsights />} />
              <Route path="/nft-wash-trade-insights" element={<NFTWashTradeInsights />} />
              <Route path="/analytics" element={<NFTMarketAnalytics />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;