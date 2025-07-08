/**
 * StoreCard - Optimized component for displaying individual store information
 */

import React, { useState } from 'react';
import { Coffee, MapPin, Clock, Phone, X, Navigation } from 'lucide-react';
import { getCategoryIcon, MAP_URLS } from '../utils';

const StoreCard = ({ store }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMapOptions, setShowMapOptions] = useState(false);

  const handleViewOnMap = () => {
    setShowMapOptions(true);
  };

  const openInMap = (mapType) => {
    const urls = MAP_URLS[mapType];
    let url;

    if (store.coordinates) {
      const { lat, lng } = store.coordinates;
      switch (mapType) {
        case 'GOOGLE':
          url = urls.withCoords(lat, lng, store.name);
          break;
        case 'WAZE':
          url = urls.withCoords(lat, lng);
          break;
        case 'APPLE':
          url = urls.withCoords(lat, lng, store.name);
          break;
        default:
          return;
      }
    } else {
      const searchQuery = `${store.name} ${store.address}`;
      url = urls.withSearch(searchQuery);
    }

    window.open(url, '_blank');
    setShowMapOptions(false);
  };

  const handleGetDirections = () => {
    if (store.coordinates) {
      const { lat, lng } = store.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      const searchQuery = encodeURIComponent(`${store.name} ${store.address}`);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`;
      window.open(url, '_blank');
    }
  };

  const handleCallStore = () => {
    if (store.phone) {
      window.location.href = `tel:${store.phone}`;
    } else {
      alert('Phone number not available for this store');
    }
  };

  const categoryIcon = getCategoryIcon(store.category);

  return (
    <>
      {/* Main Store Card */}
      <div className="bg-brand-blue text-white p-4 sm:p-6 rounded-lg shadow-store hover:shadow-lg transition-all duration-200 hover:scale-105">
        <div className="w-12 h-12 bg-bronze rounded-full mb-4 flex items-center justify-center">
          <span className="text-2xl" role="img" aria-label="Store category">
            {categoryIcon}
          </span>
        </div>
        
        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 line-clamp-2">
          {store.name}
        </h2>
        
        <div className="mb-2 sm:mb-4 space-y-1">
          <p className="text-egg-shell text-sm flex items-start">
            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{store.address}</span>
          </p>
          
          {store.province && (
            <p className="text-bronze text-sm font-medium">
              {store.province}, {store.country || 'South Africa'}
            </p>
          )}
          
          {store.distance && (
            <p className="text-green-300 text-sm font-semibold flex items-center">
              <span className="mr-1">📏</span>
              {store.distance.toFixed(1)} km away
            </p>
          )}
          
          {store.coordinates && !store.distance && (
            <p className="text-egg-shell text-xs opacity-75">
              📍 {store.coordinates.lat.toFixed(4)}, {store.coordinates.lng.toFixed(4)}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button 
            onClick={() => setShowDetails(true)}
            className="flex-1 bg-bronze text-white py-2 px-3 rounded text-sm font-medium hover:bg-orange-600 transition-colors"
            aria-label={`View details for ${store.name}`}
          >
            INFO
          </button>
          <button 
            onClick={handleViewOnMap}
            className="flex-1 border border-bronze text-bronze py-2 px-3 rounded text-sm font-medium hover:bg-bronze hover:text-white transition-colors"
            aria-label={`View ${store.name} on map`}
          >
            VIEW MAP
          </button>
        </div>
      </div>

      {/* Store Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h3 className="text-lg sm:text-xl font-bold text-brand-blue pr-4">
                {store.name}
              </h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Address */}
              <div>
                <div className="flex items-center mb-2">
                  <MapPin className="w-5 h-5 text-brand-blue mr-2" />
                  <span className="font-semibold text-gray-700">Address</span>
                </div>
                <p className="text-gray-600 ml-7">{store.address}</p>
                {store.province && (
                  <p className="text-brand-blue font-medium ml-7">
                    {store.province}, {store.country || 'South Africa'}
                  </p>
                )}
              </div>
              
              {/* Hours */}
              <div>
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-brand-blue mr-2" />
                  <span className="font-semibold text-gray-700">Hours</span>
                </div>
                <p className="text-gray-600 ml-7">
                  {store.hours || 'Mon-Sun: Hours vary by location'}
                </p>
              </div>
              
              {/* Phone */}
              {store.phone && (
                <div>
                  <div className="flex items-center mb-2">
                    <Phone className="w-5 h-5 text-brand-blue mr-2" />
                    <span className="font-semibold text-gray-700">Phone</span>
                  </div>
                  <p className="text-gray-600 ml-7">{store.phone}</p>
                </div>
              )}
              
              {/* Category */}
              <div>
                <div className="flex items-center mb-2">
                  <Coffee className="w-5 h-5 text-brand-blue mr-2" />
                  <span className="font-semibold text-gray-700">Store Type</span>
                </div>
                <p className="text-gray-600 ml-7 capitalize">
                  {categoryIcon} {store.category?.replace('_', ' ') || 'Coffee Shop'}
                </p>
              </div>
              
              {/* Coordinates */}
              {store.coordinates && (
                <div>
                  <div className="flex items-center mb-2">
                    <Navigation className="w-5 h-5 text-brand-blue mr-2" />
                    <span className="font-semibold text-gray-700">Coordinates</span>
                  </div>
                  <p className="text-gray-600 ml-7 text-sm font-mono">
                    {store.coordinates.lat.toFixed(6)}, {store.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {/* Distance */}
              {store.distance && (
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">📏</span>
                    <span className="font-semibold text-gray-700">Distance</span>
                  </div>
                  <p className="text-gray-600 ml-7">
                    {store.distance.toFixed(2)} km away
                  </p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="p-4 sm:p-6 border-t space-y-3">
              <button 
                onClick={handleGetDirections}
                className="w-full bg-brand-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center"
              >
                <Navigation className="w-5 h-5 mr-2" />
                Get Directions
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleViewOnMap}
                  className="bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  View Map
                </button>
                
                <button 
                  onClick={handleCallStore}
                  className="bg-green-100 text-green-700 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center"
                  disabled={!store.phone}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Call Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Options Modal */}
      {showMapOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-brand-blue">Choose Map App</h3>
              <button 
                onClick={() => setShowMapOptions(false)}
                className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                aria-label="Close map options"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Map Options */}
            <div className="p-4 space-y-3">
              <button 
                onClick={() => openInMap('GOOGLE')}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                🗺️ Google Maps
              </button>
              
              <button 
                onClick={() => openInMap('WAZE')}
                className="w-full bg-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors flex items-center justify-center"
              >
                🚗 Waze
              </button>
              
              <button 
                onClick={() => openInMap('APPLE')}
                className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                🍎 Apple Maps
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoreCard;