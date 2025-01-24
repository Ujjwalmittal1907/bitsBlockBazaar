import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Home from './components/Home';

import NftMarketplace from './components/nftmarketplace';
import NftMarketplaceAnalytics from './components/nftmarketplaceanalytics';
import NftMarketplaceHolders from './components/nftmarketplaceholders';
import MarketplaceTraders from './components/marketplacetraders';
import MarketplaceWashTraders from './components/marketplacewashtraders';
import NftMarketplaceOverview from './components/NftMarketplaceOverview';
import NftCollection from './components/NftCollection';
import CollectionAnalytics from './components/CollectionAnalytics';
import CollectionHolders from './components/CollectionHolders';
import CollectionScores from './components/CollectionScores';
import CollectionTraders from './components/CollectionTraders';
import CollectionWashtrade from './components/CollectionWashtrade';
import CollectionCategories from './components/CollectionCategories';
import CollectionMetadata from './components/CollectionMetadata';
import CollectionOverview from './components/CollectionOverview';

// Import NFT insight components from nft folder
import NFTTradersInsights from './components/nft/nfttradersinsights';
import NFTWashTradeInsights from './components/nft/nftwashtradeinsights';
import NFTMarketAnalyticsReport from './components/nft/nftmarketanalyticsreport';
import NFTHoldersInsights from './components/nft/NFTholdersinsights';
import NFTScoresInsights from './components/nft/NFTScoresInsights';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300 dark:bg-gray-900 bg-gray-50 dark:text-white text-gray-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* NFT Marketplace Routes */}
              <Route path="/nftmarketplaceoverview" element={<NftMarketplaceOverview />} />
              <Route path="/nftmarketplace" element={<NftMarketplace />} />
              <Route path="/marketplaceanalytics" element={<NftMarketplaceAnalytics />} />
              <Route path="/nftmarketplaceholders" element={<NftMarketplaceHolders />} />
              <Route path="/marketplacetraders" element={<MarketplaceTraders />} />
              <Route path="/marketplacewashtraders" element={<MarketplaceWashTraders />} />

              {/* NFT Collection Routes */}
              <Route path="/nftcollection" element={<NftCollection />} />
              <Route path="/collectionanalytics" element={<CollectionAnalytics />} />
              <Route path="/collectionholders" element={<CollectionHolders />} />
              <Route path="/collectionscores" element={<CollectionScores />} />
              <Route path="/collectiontraders" element={<CollectionTraders />} />
              <Route path="/collectionwashtrade" element={<CollectionWashtrade />} />
              <Route path="/collectioncategories" element={<CollectionCategories />} />
              <Route path="/collectionmetadata" element={<CollectionMetadata />} />
              <Route path="/collectionoverview" element={<CollectionOverview />} />

              {/* NFT Insights Routes */}
              <Route path="/nfttradersinsights" element={<NFTTradersInsights />} />
              <Route path="/nftwashtradeinsights" element={<NFTWashTradeInsights />} />
              <Route path="/nftmarketanalyticsreport" element={<NFTMarketAnalyticsReport />} />
              <Route path="/nftholdersinsights" element={<NFTHoldersInsights />} />
              <Route path="/nftscoresinsights" element={<NFTScoresInsights />} />
            </Routes>
          </main>
          <ThemeToggle />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;