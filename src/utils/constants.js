/**
 * Application constants
 */

// API endpoints
export const API_ENDPOINTS = {
  COMPLETE_STORES: '/seattleCoffeeComplete.json'
};

// Search and filtering constants
export const SEARCH_FIELDS = ['name', 'address', 'province', 'category', 'country'];

// Store categories with icons
export const STORE_CATEGORIES = {
  'freshstop': '🛒',
  'food_lovers_market': '🛍️',
  'petrol_station': '⛽',
  'bookstore': '📚',
  'shopping_center': '🏪',
  'default': '☕'
};

// Map app URLs
export const MAP_URLS = {
  GOOGLE: {
    withCoords: (lat, lng, name) => `https://www.google.com/maps/place/${encodeURIComponent(name)}/@${lat},${lng},15z`,
    withSearch: (query) => `https://www.google.com/maps/search/${encodeURIComponent(query)}`
  },
  WAZE: {
    withCoords: (lat, lng) => `https://www.waze.com/ul?ll=${lat}%2C${lng}&navigate=yes&zoom=17`,
    withSearch: (query) => `https://www.waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`
  },
  APPLE: {
    withCoords: (lat, lng, name) => `http://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${lat},${lng}&z=15`,
    withSearch: (query) => `http://maps.apple.com/?q=${encodeURIComponent(query)}`
  }
};