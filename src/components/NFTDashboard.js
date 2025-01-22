import React from 'react';
import NftMarketplaceHolders from './nftmarketplaceholders';
import NFTTradersInsights from './nft/nfttradersinsights';
import NFTWashTradeInsights from './nft/nftwashtradeinsights';
import NFTMarketAnalyticsReport from './nft/nftmarketanalyticsreport';
import NFTHoldersInsights from './nft/NFTholdersinsights';
import NFTScoresInsights from './nft/NftscoreresInsights';
import { useTheme } from '../context/ThemeContext';

const NFTDashboard = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`nft-dashboard ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="dashboard-grid">
        {/* Market Overview Section */}
        <div className="dashboard-section">
          <h2>NFT Market Overview</h2>
          <NftMarketplaceHolders />
        </div>

        {/* Analytics Section */}
        <div className="dashboard-section">
          <h2>Market Analytics</h2>
          <NFTMarketAnalyticsReport />
        </div>

        {/* Trading Insights Section */}
        <div className="dashboard-section">
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Trader Activity</h3>
              <NFTTradersInsights />
            </div>
            <div className="insight-card">
              <h3>Wash Trading Analysis</h3>
              <NFTWashTradeInsights />
            </div>
          </div>
        </div>

        {/* Holder Analysis Section */}
        <div className="dashboard-section">
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Holder Statistics</h3>
              <NFTHoldersInsights />
            </div>
            <div className="insight-card">
              <h3>NFT Scores</h3>
              <NFTScoresInsights />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDashboard;
