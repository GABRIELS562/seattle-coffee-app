/**
 * Store-related utility functions
 */

import { SEARCH_FIELDS, STORE_CATEGORIES } from './constants';

/**
 * Filter stores based on search query and region
 * @param {Array} stores - Array of store objects
 * @param {string} searchQuery - Search term
 * @param {string} selectedRegion - Selected province/region
 * @returns {Array} Filtered stores
 */
export const filterStores = (stores, searchQuery, selectedRegion) => {
  return stores.filter(store => {
    // Region filter
    const matchesRegion = selectedRegion === 'All' || store.province === selectedRegion;
    
    // Search filter
    if (!searchQuery.trim()) {
      return matchesRegion;
    }
    
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = SEARCH_FIELDS.some(field => {
      const value = store[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      if (Array.isArray(value)) { // For searchKeywords
        return value.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        );
      }
      return false;
    });
    
    return matchesSearch && matchesRegion;
  });
};

/**
 * Get unique provinces from stores array
 * @param {Array} stores - Array of store objects
 * @returns {Array} Array of unique provinces with 'All' prepended
 */
export const getUniqueProvinces = (stores) => {
  const provinces = stores
    .map(store => store.province)
    .filter(Boolean)
    .filter((province, index, array) => array.indexOf(province) === index)
    .sort();
    
  return ['All', ...provinces];
};

/**
 * Get category icon for a store
 * @param {string} category - Store category
 * @returns {string} Icon emoji
 */
export const getCategoryIcon = (category) => {
  return STORE_CATEGORIES[category] || STORE_CATEGORIES.default;
};

/**
 * Create sample/fallback stores for emergency use
 * @returns {Array} Array of sample store objects
 */
export const getSampleStores = () => [
  {
    id: 1,
    name: "Twenty on Vineyard",
    address: "20 Vineyard Rd, Claremont, Cape Town, 7708",
    province: "Western Cape",
    country: "South Africa",
    category: "cafe",
    coordinates: { lat: -33.9793815, lng: 18.4614803 },
    hours: "Mon-Sun: 6:00 AM - 6:00 PM",
    phone: "+27 21 671 1234",
    hasCoordinates: true
  },
  {
    id: 2,
    name: "45th Cutting FreshStop",
    address: "928 King Cetshwayo Hwy, Sherwood, Durban, 4091",
    province: "KwaZulu-Natal",
    country: "South Africa",
    category: "freshstop",
    coordinates: { lat: -29.8328006, lng: 30.9670958 },
    hours: "Mon-Sun: 5:00 AM - 10:00 PM",
    phone: "+27 31 463 1234",
    hasCoordinates: true
  },
  {
    id: 3,
    name: "A Club FreshStop",
    address: "Gauteng, South Africa",
    province: "Gauteng",
    country: "South Africa",
    category: "freshstop",
    coordinates: { lat: -25.7602088, lng: 28.2444596 },
    hours: "Mon-Sun: 5:00 AM - 10:00 PM",
    phone: "+27 11 234 5678",
    hasCoordinates: true
  }
];