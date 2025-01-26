// Base URL for all API endpoints
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.unleashnfts.com/api/v2';

// Validate API configuration
if (!process.env.REACT_APP_X_API_KEY) {
  console.error('API key is not configured. Please set REACT_APP_X_API_KEY in your environment.');
}

if (!process.env.REACT_APP_API_BASE_URL) {
  console.warn('API base URL is not configured. Using default URL:', BASE_URL);
}

// NFT Collection endpoints
export const COLLECTION_ENDPOINTS = {
  METADATA: `${BASE_URL}/nft/collection/metadata`,
  HOLDERS: `${BASE_URL}/nft/collection/holders`,
  TRADERS: `${BASE_URL}/nft/collection/traders`,
  ANALYTICS: `${BASE_URL}/nft/collection/analytics`,
  WASHTRADE: `${BASE_URL}/nft/collection/washtrade`,
  SCORES: `${BASE_URL}/nft/collection/scores`,
  CATEGORIES: `${BASE_URL}/nft/collection/categories`
};

// NFT Marketplace endpoints
export const MARKETPLACE_ENDPOINTS = {
  OVERVIEW: `${BASE_URL}/nft/marketplace/overview`,
  HOLDERS: `${BASE_URL}/nft/marketplace/holders`,
  TRADERS: `${BASE_URL}/nft/marketplace/traders`,
  ANALYTICS: `${BASE_URL}/nft/marketplace/analytics`,
  WASHTRADERS: `${BASE_URL}/nft/marketplace/washtraders`
};

// Common API options
export const getApiOptions = () => ({
  method: 'GET',
  headers: { 
    accept: 'application/json', 
    'x-api-key': process.env.REACT_APP_X_API_KEY 
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

// Default query parameters
export const DEFAULT_PARAMS = {
  blockchain: 'ethereum',
  time_range: '24h',
  sort_order: 'desc',
  offset: 0,
  limit: 30
};

// API service functions for Collections
export const CollectionAPI = {
  getMetadata: (params = {}) => {
    const url = buildUrl(COLLECTION_ENDPOINTS.METADATA, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getHolders: (params = {}) => {
    const url = buildUrl(COLLECTION_ENDPOINTS.HOLDERS, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getTraders: (params = {}) => {
    const url = buildUrl(COLLECTION_ENDPOINTS.TRADERS, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getAnalytics: (params = {}) => {
    const url = buildUrl(COLLECTION_ENDPOINTS.ANALYTICS, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getWashtrade: (params = {}) => {
    const url = buildUrl(COLLECTION_ENDPOINTS.WASHTRADE, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getScores: (params = {}) => {
    const url = buildUrl(COLLECTION_ENDPOINTS.SCORES, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getCategories: (params = {}) => {
    const url = buildUrl(COLLECTION_ENDPOINTS.CATEGORIES, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  }
};

// API service functions for Marketplace
export const MarketplaceAPI = {
  getOverview: (params = {}) => {
    const url = buildUrl(MARKETPLACE_ENDPOINTS.OVERVIEW, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getHolders: (params = {}) => {
    const url = buildUrl(MARKETPLACE_ENDPOINTS.HOLDERS, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getTraders: (params = {}) => {
    const url = buildUrl(MARKETPLACE_ENDPOINTS.TRADERS, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getAnalytics: (params = {}) => {
    const url = buildUrl(MARKETPLACE_ENDPOINTS.ANALYTICS, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  },
  
  getWashtraders: (params = {}) => {
    const url = buildUrl(MARKETPLACE_ENDPOINTS.WASHTRADERS, { ...DEFAULT_PARAMS, ...params });
    return fetch(url, getApiOptions());
  }
};
