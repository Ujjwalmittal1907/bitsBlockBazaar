// Base URL for NFT insights API endpoints
const BASE_URL = 'https://api.unleashnfts.com/api/v2/nft/market-insights';

// API Key
const API_KEY = '3e736dba7151eb8de28a065916dc9d70';

// NFT Insights endpoints
const NFT_INSIGHTS_ENDPOINTS = {
  HOLDERS: `${BASE_URL}/holders`,
  TRADERS: `${BASE_URL}/traders`,
  SCORES: `${BASE_URL}/scores`,
  WASH_TRADE: `${BASE_URL}/washtrade`,
  MARKET_ANALYTICS: `${BASE_URL}/analytics`,
  MARKET_SCORES: `${BASE_URL}/market-scores`
};

// Common API options
const getApiOptions = () => ({
  method: 'GET',
  headers: { 
    accept: 'application/json',
    'x-api-key': API_KEY
  }
});

// Helper function to build URL with query parameters
const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  const defaultParams = {
    blockchain: 'ethereum',
    time_range: '24h'
  };
  
  // Merge default params with provided params
  const finalParams = { ...defaultParams, ...params };
  
  Object.keys(finalParams).forEach(key => {
    if (finalParams[key] !== undefined && finalParams[key] !== null) {
      url.searchParams.append(key, finalParams[key]);
    }
  });
  return url.toString();
};

// API service for NFT Insights
const NFTInsightsAPI = {
  getHoldersInsights: async (params = {}) => {
    try {
      const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.HOLDERS, params);
      const response = await fetch(url, getApiOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching holders insights:', error);
      throw error;
    }
  },

  getTradersInsights: async (params = {}) => {
    try {
      const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.TRADERS, params);
      const response = await fetch(url, getApiOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching traders insights:', error);
      throw error;
    }
  },

  getScoresInsights: async (params = {}) => {
    try {
      const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.SCORES, params);
      const response = await fetch(url, getApiOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching scores insights:', error);
      throw error;
    }
  },

  getWashTradeInsights: async (params = {}) => {
    try {
      const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.WASH_TRADE, params);
      const response = await fetch(url, getApiOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching wash trade insights:', error);
      throw error;
    }
  },

  getMarketAnalytics: async (params = {}) => {
    try {
      const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.MARKET_ANALYTICS, params);
      const response = await fetch(url, getApiOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching market analytics:', error);
      throw error;
    }
  },

  getMarketScores: async (params = {}) => {
    try {
      const url = buildUrl(NFT_INSIGHTS_ENDPOINTS.MARKET_SCORES, params);
      const response = await fetch(url, getApiOptions());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching market scores:', error);
      throw error;
    }
  }
};

export { NFT_INSIGHTS_ENDPOINTS, getApiOptions, buildUrl, NFTInsightsAPI };
