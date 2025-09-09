/**
 * LocationsPage - Main page for displaying and filtering Seattle Coffee stores
 */

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, useRef } from 'react';
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

// Import mobile testing utilities in development
if (process.env.NODE_ENV === 'development') {
  import('../utils/mobileTest').then(({ runMobileTestSuite }) => {
    // Add mobile test to window for easy console access
    window.testMobileUI = runMobileTestSuite;
  });
}

// Grid style to ensure consistent spacing
const gridStyle = {
  display: 'grid',
  gap: '20px',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))'
};

const LocationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // For immediate input display
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPaginated, setShowPaginated] = useState(true);
  const [gridKey, setGridKey] = useState(0); // Force re-render of grids

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

  // Force grid re-render when stores are loaded
  useEffect(() => {
    if (stores.length > 0 && !loading) {
      // Force a re-render of grids after initial load
      setGridKey(prev => prev + 1);
    }
  }, [stores.length, loading]);

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

  // Handle search with debouncing for better performance
  const searchTimeoutRef = useRef(null);
  
  const handleSearch = useCallback((value) => {
    // Update input immediately for responsiveness
    setSearchInput(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debouncing actual search
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle region selection
  const handleRegionChange = useCallback((region) => {
    setSelectedRegion(region);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchInput('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
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
    <div id="store-locator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <header className="mb-6 sm:mb-8 lg:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-blue mb-4 text-center leading-tight">Store Locations</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-gray-600 text-base sm:text-lg">Find your nearest coffee shop location</p>
          <button
            onClick={handleLocationRequest}
            disabled={locationLoading}
            className="flex items-center justify-center space-x-2 bg-brand-blue hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors text-sm font-semibold touch-manipulation min-h-[48px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 shadow-sm"
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
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by store name, address, or province..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors text-base bg-white shadow-sm"
            aria-label="Search stores"
          />
        </div>
        
        {/* Region Filter */}
        <div className="relative sm:min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" aria-hidden="true" />
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors appearance-none bg-white text-base shadow-sm cursor-pointer"
            aria-label="Filter by region"
          >
            {uniqueProvinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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
        
        {(searchQuery || searchInput) && (
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

      {/* Nearest Stores Section - Only show when location is detected */}
      {hasLocation && processedStores.length > 0 && (
        <section className="mb-8" aria-label="Nearest stores">
          <div className="bg-gradient-to-r from-brand-blue to-blue-700 text-white p-4 sm:p-6 rounded-xl shadow-lg mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Nearest Stores to You
            </h2>
            <p className="text-egg-shell opacity-90 text-sm">
              Top 5 closest locations based on your current position
            </p>
          </div>
          
          {/* Show top 5 nearest stores in a special layout */}
          <div key={`nearest-grid-${gridKey}`} className="mb-8" style={gridStyle}>
            {processedStores.slice(0, 5).map((store, index) => (
              <div key={store.id || `${store.name}-${store.address}`} className="relative">
                {index === 0 && (
                  <div className="absolute -top-2 -left-2 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    Closest
                  </div>
                )}
                <div className={`${index === 0 ? 'ring-2 ring-green-500 ring-offset-2' : ''} rounded-lg`}>
                  <StoreCard store={store} />
                </div>
              </div>
            ))}
          </div>
          
          {processedStores.length > 5 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                All Other Stores ({processedStores.length - 5} locations)
              </h3>
            </div>
          )}
        </section>
      )}

      {/* Store Grid - Modified to show remaining stores when location is detected */}
      <section aria-label="Store listings">
        {processedStores.length > 0 ? (
          <Suspense fallback={<LoadingSpinner size="lg" message="Loading stores..." />}>
            {/* When location is detected, show remaining stores */}
            {hasLocation && processedStores.length > 5 ? (
              <div key={`remaining-grid-${gridKey}`} className="w-full" style={gridStyle}>
                {processedStores.slice(5).map(store => (
                  <div key={store.id || `${store.name}-${store.address}`} className="w-full">
                    <StoreCard store={store} />
                  </div>
                ))}
              </div>
            ) : !hasLocation ? (
              /* When no location, show all stores with virtualization for large lists */
              processedStores.length > 20 && showPaginated ? (
                <VirtualizedStoreList key={`virtual-grid-${gridKey}`} stores={processedStores} />
              ) : (
                <div key={`all-stores-grid-${gridKey}`} className="w-full" style={gridStyle}>
                  {processedStores.map(store => (
                    <div key={store.id || `${store.name}-${store.address}`} className="w-full">
                      <StoreCard store={store} />
                    </div>
                  ))}
                </div>
              )
            ) : null}
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
                setSearchInput('');
                setSelectedRegion('All');
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
              }}
              className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-blue-800 active:bg-blue-900 transition-colors font-medium min-h-[48px] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 shadow-sm"
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