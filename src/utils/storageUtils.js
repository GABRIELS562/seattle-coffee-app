/**
 * Local storage utilities for caching store data
 */

const CACHE_KEYS = {
  STORES: 'seattleCoffeeStores_v2',
  TIMESTAMP: 'seattleCoffeeStores_timestamp'
};

const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached stores if they exist and are not expired
 * @returns {Array|null} Cached stores or null if not available/expired
 */
export const getCachedStores = () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEYS.STORES);
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
 */
export const setCachedStores = (stores) => {
  try {
    localStorage.setItem(CACHE_KEYS.STORES, JSON.stringify(stores));
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
    localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};