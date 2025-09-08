/**
 * LocationsPage - Main page for displaying and filtering Seattle Coffee stores
 */

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Search, MapPin, Filter, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNativeLocation as useLocation } from '../hooks/useNativeLocation';

const VirtualizedStoreList = lazy(() => import('../components/VirtualizedStoreList'));
const StoreCard = lazy(() => import('../components/StoreCard'));
import {
  addCoordinatesToStores,
  addDistanceToStores,
  sortStoresByDistance,
  filterStores,
  getUniqueProvinces,
  getSampleStores,
  getCachedStores,
  setCachedStores,
  clearCachedStores,
  API_ENDPOINTS
} from '../utils';

const LocationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPaginated, setShowPaginated] = useState(true);

  const { userLocation, locationLoading, locationError, requestLocation, clearLocation, hasLocation } = useLocation();

  // Load stores with progressive enhancement strategy
  useEffect(() => {
    const loadStores = async () => {
      setError(null);
      
      try {
        // STEP 1: Try cache with coordinates first for instant load
        const cachedWithCoords = getCachedStores(true);
        if (cachedWithCoords && cachedWithCoords.length > 0) {
          setStores(cachedWithCoords);
          setLoading(false);
          setLoadingComplete(true);
          return;
        }

        // STEP 2: Try cache without coordinates
        const cachedStores = getCachedStores(false);
        if (cachedStores && cachedStores.length > 0) {
          // Show immediately
          setStores(cachedStores);
          setLoading(false);
          
          // Add coordinates and cache the result
          requestAnimationFrame(() => {
            const storesWithCoords = addCoordinatesToStores(cachedStores);
            setStores(storesWithCoords);
            setCachedStores(storesWithCoords, true);
            setLoadingComplete(true);
          });
          return;
        }

        // STEP 3: Load fallback stores immediately if no cache
        const { stores: fallbackStores } = await import('../data/fallbackStores');
        const fallbackWithCoords = addCoordinatesToStores(fallbackStores);
        setStores(fallbackWithCoords);
        setLoading(false);

        // STEP 4: Fetch complete database in background
        const response = await fetch(API_ENDPOINTS.COMPLETE_STORES);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.stores || !Array.isArray(data.stores)) {
          throw new Error('Invalid data format received');
        }

        // Cache raw data immediately
        setCachedStores(data.stores, false);
        
        // Add coordinates and show
        const storesWithCoordinates = addCoordinatesToStores(data.stores);
        setStores(storesWithCoordinates);
        
        // Cache with coordinates for next time
        setCachedStores(storesWithCoordinates, true);
        setLoadingComplete(true);
        
      } catch (fetchError) {
        console.error('Store loading error:', fetchError);
        setError('Unable to load all stores. Showing available stores.');
        
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


  // Handle location request with proper error handling
  const handleLocationRequest = useCallback(async () => {
    try {
      console.log('Requesting location...');
      const location = await requestLocation();
      console.log('Location received:', location);
      // Auto-select 'All' to show distance-sorted stores
      setSelectedRegion('All');
      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error('Location request failed:', error);
      // Don't set error state, just log it - the hook already manages error state
      // Users can still browse stores without location
    }
  }, [requestLocation]);

  // Process stores with distance and filtering
  const processedStores = useMemo(() => {
    // Filter stores based on search and region
    const filtered = filterStores(stores, searchQuery, selectedRegion);
    
    // Add distance if user location is available
    const withDistance = addDistanceToStores(filtered, userLocation);
    
    // Sort by distance if available
    const sorted = sortStoresByDistance(withDistance);
    
    return sorted;
  }, [stores, searchQuery, selectedRegion, userLocation]);

  // Get unique provinces for filter dropdown
  const uniqueProvinces = useMemo(() => getUniqueProvinces(stores), [stores]);

  // Handle search with debouncing
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  // Handle region selection
  const handleRegionChange = useCallback((region) => {
    setSelectedRegion(region);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      clearCachedStores();
      const response = await fetch(API_ENDPOINTS.COMPLETE_STORES);
      if (response.ok) {
        const data = await response.json();
        if (data.stores && Array.isArray(data.stores)) {
          const storesWithCoordinates = addCoordinatesToStores(data.stores);
          setStores(storesWithCoordinates);
          setCachedStores(data.stores, false);
          setCachedStores(storesWithCoordinates, true);
        }
      }
    } catch (error) {
      setError('Failed to refresh stores');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading stores..." />
      </div>
    );
  }

  return (
    <div id="store-locator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-4 text-center">Store Locations</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-gray-600">Find your nearest Seattle Coffee location</p>
          <button
            onClick={handleLocationRequest}
            disabled={locationLoading}
            className="flex items-center space-x-2 bg-brand-blue hover:bg-blue-800 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors text-sm font-semibold touch-manipulation min-h-[44px]"
            aria-label="Get current location to find nearest stores"
          >
            {locationLoading ? (
              <>
                <LoadingSpinner size="sm" message="" />
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
        
        {/* Location Error */}
        {locationError && !hasLocation && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              📍 {locationError}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <p className="text-red-800 text-sm">⚠️ {error}</p>
          </div>
        )}
      </header>

      {/* Search and Filter Controls */}
      <section className="mb-6 sm:mb-8 space-y-4 sm:space-y-0 sm:flex sm:space-x-4" aria-label="Search and filter options">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by store name, address, or province..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-base"
            aria-label="Search stores"
          />
        </div>
        
        {/* Region Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent appearance-none bg-white min-w-48 text-base"
            aria-label="Filter by region"
          >
            {uniqueProvinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>
      </section>

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
            onClick={clearSearch}
            className="text-brand-blue hover:text-blue-800 text-sm font-medium transition-colors"
            aria-label="Clear search query"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Refresh Button */}
      {loadingComplete && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 text-brand-blue hover:text-blue-800 disabled:text-gray-400 transition-colors"
            aria-label="Refresh store list"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      )}

      {/* Store Grid */}
      <section aria-label="Store listings">
        {processedStores.length > 0 ? (
          <Suspense fallback={<LoadingSpinner size="lg" message="Loading stores..." />}>
            {processedStores.length > 20 && showPaginated ? (
              <VirtualizedStoreList stores={processedStores} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {processedStores.map(store => (
                  <StoreCard key={store.id || `${store.name}-${store.address}`} store={store} />
                ))}
              </div>
            )}
          </Suspense>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
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
              className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium min-h-[44px]"
              aria-label="Clear filters and view all stores"
            >
              View All Stores
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default LocationsPage;