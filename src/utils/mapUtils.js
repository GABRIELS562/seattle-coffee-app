/**
 * Map-related utility functions
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lon1 - First point longitude  
 * @param {number} lat2 - Second point latitude
 * @param {number} lon2 - Second point longitude
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Find nearest stores to user location
 * @param {Object} userLocation - User's coordinates {lat, lng}
 * @param {Array} storesList - Array of store objects
 * @param {number} limit - Maximum number of stores to return
 * @returns {Array} Sorted array of nearest stores with distance
 */
export const findNearestStores = (userLocation, storesList, limit = 10) => {
  return storesList
    .filter(store => store.coordinates)
    .map(store => ({
      ...store,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        store.coordinates.lat,
        store.coordinates.lng
      )
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

/**
 * Add distance to stores based on user location
 * @param {Array} stores - Array of store objects
 * @param {Object} userLocation - User's coordinates {lat, lng}
 * @returns {Array} Stores with distance property added
 */
export const addDistanceToStores = (stores, userLocation) => {
  if (!userLocation) return stores;
  
  return stores.map(store => {
    if (store.coordinates) {
      return {
        ...store,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          store.coordinates.lat,
          store.coordinates.lng
        )
      };
    }
    return store;
  });
};

/**
 * Sort stores by distance if available, otherwise maintain original order
 * @param {Array} stores - Array of store objects
 * @returns {Array} Sorted stores
 */
export const sortStoresByDistance = (stores) => {
  return stores.sort((a, b) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    return 0;
  });
};