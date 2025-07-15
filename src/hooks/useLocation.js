/**
 * Custom hook for managing user location
 */

import { useState, useCallback } from 'react';
import { BERGVLIET_COORDINATES } from '../utils/constants';

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const requestLocation = useCallback((useTestLocation = false) => {
    setLocationLoading(true);
    setLocationError(null);
    
    // TEMPORARY: Use Bergvliet coordinates for testing
    if (useTestLocation) {
      console.log('🧪 Using Bergvliet test coordinates');
      setUserLocation(BERGVLIET_COORDINATES);
      setLocationLoading(false);
      return Promise.resolve(BERGVLIET_COORDINATES);
    }
    
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser.';
        setLocationError(error);
        setLocationLoading(false);
        reject(new Error(error));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLocationLoading(false);
          console.log('📍 User location obtained:', location);
          resolve(location);
        },
        (error) => {
          const errorMessage = 'Unable to get your location. Please ensure location services are enabled.';
          setLocationError(errorMessage);
          setLocationLoading(false);
          console.error('❌ Location error:', error);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setUserLocation(null);
    setLocationError(null);
  }, []);

  return {
    userLocation,
    locationLoading,
    locationError,
    requestLocation,
    clearLocation,
    hasLocation: !!userLocation
  };
};