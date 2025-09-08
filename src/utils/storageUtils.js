/**
 * Local storage utilities for caching store data
 */

const CACHE_KEYS = {
  STORES: 'seattleCoffeeStores_v3',
  STORES_WITH_COORDS: 'seattleCoffeeStores_coords_v3',
  TIMESTAMP: 'seattleCoffeeStores_timestamp'
};

const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached stores if they exist and are not expired
 * @param {boolean} withCoords - Whether to get stores with coordinates
 * @returns {Array|null} Cached stores or null if not available/expired
 */
export const getCachedStores = (withCoords = false) => {
  try {
    const cacheKey = withCoords ? CACHE_KEYS.STORES_WITH_COORDS : CACHE_KEYS.STORES;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
    
    if (cachedData && cachedTime) {
      const age = Date.now() - parseInt(cachedTime);
      if (age < CACHE_MAX_AGE) {
        return JSON.parse(cachedData);
      } else {
        // Clear expired cache
        clearCachedStores();
      }
    }
  } catch (error) {
    console.warn('Error reading from cache:', error);
    clearCachedStores();
  }
  
  return null;
};

/**
 * Cache stores data
 * @param {Array} stores - Stores to cache
 * @param {boolean} withCoords - Whether stores have coordinates
 */
export const setCachedStores = (stores, withCoords = false) => {
  try {
    const cacheKey = withCoords ? CACHE_KEYS.STORES_WITH_COORDS : CACHE_KEYS.STORES;
    localStorage.setItem(cacheKey, JSON.stringify(stores));
    localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.warn('Failed to cache stores:', error);
  }
};

/**
 * Clear cached stores
 */
export const clearCachedStores = () => {
  try {
    localStorage.removeItem(CACHE_KEYS.STORES);
    localStorage.removeItem(CACHE_KEYS.STORES_WITH_COORDS);
    localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};