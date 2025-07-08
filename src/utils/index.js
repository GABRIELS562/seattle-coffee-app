/**
 * Utility functions index - centralized exports
 */

// Map utilities
export {
  calculateDistance,
  findNearestStores,
  addDistanceToStores,
  sortStoresByDistance
} from './mapUtils';

// Coordinate mapping
export {
  addCoordinatesToStore,
  addCoordinatesToStores
} from './coordinateMapper';

// Storage utilities
export {
  getCachedStores,
  setCachedStores,
  clearCachedStores
} from './storageUtils';

// Store utilities
export {
  filterStores,
  getUniqueProvinces,
  getCategoryIcon,
  getSampleStores
} from './storeUtils';

// Constants
export {
  BERGVLIET_COORDINATES,
  API_ENDPOINTS,
  SEARCH_FIELDS,
  STORE_CATEGORIES,
  MAP_URLS
} from './constants';