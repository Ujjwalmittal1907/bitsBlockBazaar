import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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

const App = () => {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nftmarketplaceoverview" element={<NftMarketplaceOverview />} />
          <Route path="/nftmarketplace" element={<NftMarketplace />} />
          <Route path="/nftmarketplaceanalytics" element={<NftMarketplaceAnalytics />} />
          <Route path="/nftmarketplaceholders" element={<NftMarketplaceHolders />} />
          <Route path="/marketplacetraders" element={<MarketplaceTraders />} />
          <Route path="/marketplacewashtraders" element={<MarketplaceWashTraders />} />
          <Route path="/marketplaceanalytics" element={<NftMarketplaceAnalytics />} />
          <Route path="/nftcollection" element={<NftCollection />} />
          <Route path="/collectionanalytics" element={<CollectionAnalytics />} />
          <Route path="/collectionholders" element={<CollectionHolders />} />
          <Route path="/collectionscores" element={<CollectionScores />} />
          <Route path="/collectiontraders" element={<CollectionTraders />} />
          <Route path="/collectionwashtrade" element={<CollectionWashtrade />} />
          <Route path="/collectioncategories" element={<CollectionCategories />} />
          <Route path="/collectionmetadata" element={<CollectionMetadata />} />
          <Route path="/collectionoverview" element={<CollectionOverview />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;