// Base URL for NFT insights API endpoints
const BASE_URL = 'https://api.unleashnfts.com/api/v2/nft/market-insights';

// API Key
const API_KEY = '3e736dba7151eb8de28a065916dc9d70';

// NFT Insights endpoints
export const NFT_INSIGHTS_ENDPOINTS = {
  HOLDERS: `${BASE_URL}/holders`,
  TRADERS: `${BASE_URL}/traders`,
  SCORES: `${BASE_URL}/scores`,
  WASH_TRADE: `${BASE_URL}/washtrade`,
  MARKET_ANALYTICS: `${BASE_URL}/analytics`,
  MARKET_SCORES: `${BASE_URL}/market-scores`
};

// Common API options
export const getApiOptions = () => ({
  method: 'GET',
  headers: { 
    accept: 'application/json',
    'x-api-key': API_KEY
  }
});

// Helper function to build URL with query parameters
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// API service for NFT Insights
export const NFTInsightsAPI = {
  getHoldersInsights: (params = {}) => {
    const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.HOLDERS, params);
    return fetch(url, getApiOptions());
  },

  getTradersInsights: (params = {}) => {
    const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.TRADERS, params);
    return fetch(url, getApiOptions());
  },

  getScoresInsights: (params = {}) => {
    const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.SCORES, params);
    return fetch(url, getApiOptions());
  },

  getWashTradeInsights: (params = {}) => {
    const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.WASH_TRADE, params);
    return fetch(url, getApiOptions());
  },

  getMarketAnalytics: (params = {}) => {
    const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.MARKET_ANALYTICS, params);
    return fetch(url, getApiOptions());
  },

  getMarketScores: (params = {}) => {
    const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.MARKET_SCORES, params);
    return fetch(url, getApiOptions());
  }
};
