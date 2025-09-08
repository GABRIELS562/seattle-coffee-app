/**
 * Coordinate mapping utilities for stores across South Africa and Namibia
 */

/**
 * City/Area coordinate mappings - precise coordinates for major locations
 */
const CITY_COORDINATES = {
  // CAPE TOWN SUBURBS - Precise coordinates (Bergvliet area focus)
  'tokai': { lat: -34.0697, lng: 18.4234 },
  'constantia': { lat: -34.0147, lng: 18.4233 },
  'bergvliet': { lat: -34.0447, lng: 18.4300 },
  'kenilworth': { lat: -34.0023, lng: 18.4517 },
  'claremont': { lat: -33.9794, lng: 18.4615 },
  'rondebosch': { lat: -33.9606, lng: 18.4746 },
  'wynberg': { lat: -34.0044, lng: 18.4564 },
  'steenberg': { lat: -34.0650, lng: 18.4201 },
  'retreat': { lat: -34.0515, lng: 18.4739 },
  'muizenberg': { lat: -34.1035, lng: 18.4754 },
  'fish hoek': { lat: -34.1361, lng: 18.4305 },
  'cavendish': { lat: -34.0261, lng: 18.4086 },
  'canal walk': { lat: -33.8965, lng: 18.5107 },
  'century city': { lat: -33.8965, lng: 18.5107 },
  'v&a': { lat: -33.9025, lng: 18.4187 },
  'waterfront': { lat: -33.9025, lng: 18.4187 },
  'tyger valley': { lat: -33.8745, lng: 18.5816 },
  'bellville': { lat: -33.8803, lng: 18.6292 },
  'durbanville': { lat: -33.8349, lng: 18.6546 },
  'milnerton': { lat: -33.8710, lng: 18.4821 },
  'goodwood': { lat: -33.8873, lng: 18.5284 },
  'parow': { lat: -33.8947, lng: 18.5664 },
  'brackenfell': { lat: -33.8667, lng: 18.6833 },
  'kraaifontein': { lat: -33.8333, lng: 18.7167 },
  'somerset west': { lat: -34.0892, lng: 18.8492 },
  'strand': { lat: -34.1167, lng: 18.8167 },
  'stellenbosch': { lat: -33.9321, lng: 18.8602 },
  'paarl': { lat: -33.7178, lng: 18.9577 },
  'worcester': { lat: -33.6467, lng: 19.4450 },
  'george': { lat: -33.9628, lng: 22.4622 },
  'knysna': { lat: -34.0361, lng: 23.0471 },
  'plettenberg': { lat: -34.0524, lng: 23.3718 },
  'mossel bay': { lat: -34.1836, lng: 22.1467 },
  'oudtshoorn': { lat: -33.5970, lng: 22.2056 },

  // JOHANNESBURG & GAUTENG - Precise coordinates
  'sandton': { lat: -26.1076, lng: 28.0567 },
  'fourways': { lat: -26.0123, lng: 28.0198 },
  'rosebank': { lat: -26.1445, lng: 28.0436 },
  'melrose': { lat: -26.1334, lng: 28.0667 },
  'randburg': { lat: -26.0946, lng: 28.0094 },
  'bryanston': { lat: -26.0688, lng: 28.0167 },
  'woodmead': { lat: -26.0665, lng: 28.0985 },
  'roodepoort': { lat: -26.1625, lng: 27.8717 },
  'boksburg': { lat: -26.2145, lng: 28.2593 },
  'germiston': { lat: -26.2309, lng: 28.1775 },
  'alberton': { lat: -26.2674, lng: 28.1211 },
  'edenvale': { lat: -26.1403, lng: 28.1505 },
  'kempton': { lat: -26.1015, lng: 28.2292 },
  'benoni': { lat: -26.1884, lng: 28.3209 },
  'springs': { lat: -26.2502, lng: 28.4392 },
  'krugersdorp': { lat: -26.0916, lng: 27.7740 },
  'centurion': { lat: -25.8601, lng: 28.1878 },
  'pretoria': { lat: -25.7479, lng: 28.2293 },
  'midrand': { lat: -25.9885, lng: 28.1289 },
  'johannesburg': { lat: -26.2041, lng: 28.0473 },

  // DURBAN & KWAZULU-NATAL
  'durban': { lat: -29.8587, lng: 31.0218 },
  'umhlanga': { lat: -29.7195, lng: 31.0820 },
  'pinetown': { lat: -29.8088, lng: 30.8719 },
  'westville': { lat: -29.8386, lng: 30.9289 },
  'hillcrest': { lat: -29.7708, lng: 30.7344 },
  'gillitts': { lat: -29.7875, lng: 30.7333 },
  'pietermaritzburg': { lat: -29.6196, lng: 30.3794 },
  'hilton': { lat: -29.5675, lng: 30.3134 },
  'ballito': { lat: -29.5391, lng: 31.2136 },

  // OTHER MAJOR CITIES
  'port elizabeth': { lat: -33.9248, lng: 25.5564 },
  'gqeberha': { lat: -33.9248, lng: 25.5564 },
  'east london': { lat: -33.0153, lng: 27.9116 },
  'bloemfontein': { lat: -29.0852, lng: 26.1596 },
  'polokwane': { lat: -23.9045, lng: 29.4689 },
  'nelspruit': { lat: -25.4753, lng: 30.9694 },
  'mbombela': { lat: -25.4753, lng: 30.9694 },
  'kimberley': { lat: -28.7282, lng: 24.7499 },
  'rustenburg': { lat: -25.6672, lng: 27.2424 },
  'potchefstroom': { lat: -26.7056, lng: 27.0982 },
  'windhoek': { lat: -22.5609, lng: 17.0658 },
};

/**
 * Province default coordinates for fallback
 */
const PROVINCE_COORDINATES = {
  'Western Cape': { lat: -33.9249, lng: 18.4241 },
  'Gauteng': { lat: -26.2041, lng: 28.0473 },
  'KwaZulu-Natal': { lat: -29.8587, lng: 31.0218 },
  'Eastern Cape': { lat: -33.9248, lng: 25.5564 },
  'Free State': { lat: -29.0852, lng: 26.1596 },
  'Limpopo': { lat: -23.9045, lng: 29.4689 },
  'Mpumalanga': { lat: -25.4753, lng: 30.9694 },
  'Northern Cape': { lat: -28.7282, lng: 24.7499 },
  'North West': { lat: -25.6672, lng: 27.2424 },
};

/**
 * Country default coordinates for final fallback
 */
const COUNTRY_COORDINATES = {
  'Namibia': { lat: -22.5609, lng: 17.0658 },
  'South Africa': { lat: -33.9249, lng: 18.4241 }, // Cape Town default
};

/**
 * Get coordinates for a store based on address and name analysis
 * @param {Object} store - Store object with address, name, province, country
 * @returns {Object} Store with coordinates added
 */
export const addCoordinatesToStore = (store) => {
  if (store.coordinates) {
    return store; // Already has coordinates
  }

  const searchText = `${store.address} ${store.name}`.toLowerCase();
  
  // Try to match with city coordinates first
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (searchText.includes(city)) {
      return {
        ...store,
        coordinates: coords,
        hasCoordinates: true
      };
    }
  }

  // Fallback to province coordinates
  const provinceCoords = PROVINCE_COORDINATES[store.province];
  if (provinceCoords) {
    return {
      ...store,
      coordinates: provinceCoords,
      hasCoordinates: true
    };
  }

  // Final fallback to country coordinates
  const countryCoords = COUNTRY_COORDINATES[store.country] || COUNTRY_COORDINATES['South Africa'];
  return {
    ...store,
    coordinates: countryCoords,
    hasCoordinates: true
  };
};

/**
 * Add coordinates to an array of stores with batch processing
 * @param {Array} stores - Array of store objects
 * @returns {Array} Stores with coordinates added
 */
export const addCoordinatesToStores = (stores) => {
  if (!stores || stores.length === 0) return [];
  
  // Process in chunks to avoid blocking the UI
  const CHUNK_SIZE = 100;
  const result = [];
  
  for (let i = 0; i < stores.length; i += CHUNK_SIZE) {
    const chunk = stores.slice(i, i + CHUNK_SIZE);
    result.push(...chunk.map(addCoordinatesToStore));
  }
  
  return result;
};