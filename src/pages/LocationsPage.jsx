/**
 * LocationsPage - Main page for displaying and filtering Seattle Coffee stores
 */

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import StoreCard from '../components/StoreCard';
import { useLocation } from '../hooks/useLocation';
import {
  addCoordinatesToStores,
  addDistanceToStores,
  sortStoresByDistance,
  filterStores,
  getUniqueProvinces,
  getSampleStores,
  getCachedStores,
  setCachedStores,
  API_ENDPOINTS
} from '../utils';

const LocationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [error, setError] = useState(null);

  const { userLocation, locationLoading, requestLocation, clearLocation, hasLocation } = useLocation();

  // Load stores with progressive enhancement strategy
  useEffect(() => {
    const loadStores = async () => {
      console.log('🔄 Starting store loading process...');
      setError(null);
      
      try {
        // STEP 1: Load fallback stores immediately for fast initial render
        const { stores: fallbackStores } = await import('../data/fallbackStores');
        const fallbackWithCoords = addCoordinatesToStores(fallbackStores);
        setStores(fallbackWithCoords);
        setLoading(false);
        console.log(`⚡ Quick loaded ${fallbackStores.length} fallback stores`);

        // STEP 2: Try cache first
        const cachedStores = getCachedStores();
        if (cachedStores) {
          const cachedWithCoords = addCoordinatesToStores(cachedStores);
          console.log(`⚡ Loaded ${cachedStores.length} stores from cache`);
          setStores(cachedWithCoords);
          setLoadingComplete(true);
          return;
        }

        // STEP 3: Fetch complete database
        console.log('📡 Fetching complete database...');
        const response = await fetch(API_ENDPOINTS.COMPLETE_STORES);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.stores || !Array.isArray(data.stores)) {
          throw new Error('Invalid data format received');
        }

        console.log(`✅ Loaded ${data.stores.length} stores from database`);
        
        // Add coordinates to all stores
        const storesWithCoordinates = addCoordinatesToStores(data.stores);
        
        // Debug logging for local stores
        logLocalStoreData(storesWithCoordinates);
        
        setStores(storesWithCoordinates);
        setLoadingComplete(true);
        
        // Cache the original data (without coordinates to save space)
        setCachedStores(data.stores);
        
      } catch (fetchError) {
        console.error('❌ Failed to load stores:', fetchError);
        setError(fetchError.message);
        
        // Ensure we have some stores to show
        if (stores.length === 0) {
          const sampleStores = getSampleStores();
          setStores(sampleStores);
        }
        setLoadingComplete(true);
      }
    };
    
    loadStores();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper function to log debug data for local stores
  const logLocalStoreData = (allStores) => {
    const localStores = allStores.filter(store => 
      store.name.toLowerCase().includes('tokai') ||
      store.name.toLowerCase().includes('constantia') ||
      store.name.toLowerCase().includes('kenilworth') ||
      store.address.toLowerCase().includes('tokai') ||
      store.address.toLowerCase().includes('constantia') ||
      store.address.toLowerCase().includes('kenilworth')
    );
    
    console.log('🏠 Local stores found:', localStores.map(s => ({
      name: s.name,
      address: s.address,
      coordinates: s.coordinates
    })));

    // Check for Tokai specifically
    const tokaiStore = allStores.find(store => 
      store.name.toLowerCase().includes('tokai')
    );
    if (tokaiStore) {
      console.log('🏪 Tokai store found:', tokaiStore.name, '-', tokaiStore.address);
    } else {
      console.warn('⚠️ No Tokai store found in database');
    }
  };

  // Handle location request with proper error handling
  const handleLocationRequest = async () => {
    try {
      const location = await requestLocation();
      console.log('✅ Location obtained:', location);
      
      // Auto-select 'All' to show distance-sorted stores
      setSelectedRegion('All');
      
    } catch (error) {
      console.error('❌ Location request failed:', error);
      alert(error.message);
    }
  };

  // Process stores with distance and filtering
  const processedStores = React.useMemo(() => {
    // Filter stores based on search and region
    const filtered = filterStores(stores, searchQuery, selectedRegion);
    
    // Add distance if user location is available
    const withDistance = addDistanceToStores(filtered, userLocation);
    
    // Sort by distance if available
    const sorted = sortStoresByDistance(withDistance);
    
    return sorted;
  }, [stores, searchQuery, selectedRegion, userLocation]);

  // Get unique provinces for filter dropdown
  const uniqueProvinces = getUniqueProvinces(stores);

  // Debug logging for processed stores
  useEffect(() => {
    if (hasLocation && processedStores.length > 0) {
      const storesWithDistance = processedStores.filter(store => store.distance !== undefined);
      
      console.log(`🎯 Processed stores summary:`);
      console.log(`- User location: ${userLocation.lat}, ${userLocation.lng}`);
      console.log(`- Region filter: "${selectedRegion}"`);
      console.log(`- Search query: "${searchQuery}"`);
      console.log(`- Total filtered: ${processedStores.length}`);
      console.log(`- With distance: ${storesWithDistance.length}`);
      
      const top5 = storesWithDistance.slice(0, 5).map(s => ({
        name: s.name,
        distance: `${s.distance.toFixed(2)} km`,
        province: s.province
      }));
      console.log(`🏆 Top 5 nearest:`, top5);
    }
  }, [processedStores, hasLocation, userLocation, selectedRegion, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-brand-blue">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-blue mb-2">Store Locations</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-gray-600">Find your nearest Seattle Coffee location</p>
          <button
            onClick={handleLocationRequest}
            disabled={locationLoading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
          >
            {locationLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Getting Location...</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>Share My Location</span>
              </>
            )}
          </button>
        </div>
        
        {/* Location Status */}
        {hasLocation && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location detected! Showing stores sorted by distance.
              <button 
                onClick={clearLocation}
                className="ml-2 text-green-600 hover:text-green-800 text-xs underline"
              >
                Clear location
              </button>
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">⚠️ {error}</p>
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by store name, address, or province..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
        
        {/* Region Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent appearance-none bg-white min-w-48"
          >
            {uniqueProvinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600 flex items-center">
          <MapPin className="inline w-4 h-4 mr-1" />
          {processedStores.length} store{processedStores.length !== 1 ? 's' : ''} found
          <span className="text-xs text-gray-400 ml-2">
            (Total: {stores.length} stores loaded)
          </span>
          {!loadingComplete && stores.length <= 10 && (
            <span className="text-xs text-blue-500 ml-2 animate-pulse">
              Loading complete database...
            </span>
          )}
        </p>
        
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-brand-blue hover:text-blue-800 text-sm"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Store Grid */}
      {processedStores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {processedStores.map(store => (
            <StoreCard key={store.id || `${store.name}-${store.address}`} store={store} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No stores found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? `No stores match "${searchQuery}"` 
              : `No stores found in ${selectedRegion}`
            }
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRegion('All');
            }}
            className="bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            View All Stores
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;