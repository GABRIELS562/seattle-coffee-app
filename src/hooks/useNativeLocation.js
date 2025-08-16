/**
 * Native-aware location hook that uses Capacitor on mobile devices
 */

import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export const useNativeLocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const requestLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);
    
    try {
      // Check if we're running on a native platform
      if (Capacitor.isNativePlatform()) {
        // Request permissions first
        const permissions = await Geolocation.requestPermissions();
        
        if (permissions.location === 'granted' || permissions.location === 'prompt') {
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
          
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(location);
          setLocationLoading(false);
          return location;
        } else {
          throw new Error('Location permission denied');
        }
      } else {
        // Fall back to browser geolocation API
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
              resolve(location);
            },
            (error) => {
              const errorMessage = 'Unable to get your location. Please ensure location services are enabled.';
              setLocationError(errorMessage);
              setLocationLoading(false);
              reject(new Error(errorMessage));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            }
          );
        });
      }
    } catch (error) {
      const errorMessage = error.message || 'Unable to get your location.';
      setLocationError(errorMessage);
      setLocationLoading(false);
      throw new Error(errorMessage);
    }
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
    hasLocation: !!userLocation,
    isNative: Capacitor.isNativePlatform()
  };
};