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
        console.log('Native permissions response:', permissions);
        
        if (permissions.location === 'granted' || permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') {
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
              let errorMessage = 'Unable to get your location. ';
              
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage += 'Location permission was denied. Please enable location access in your browser settings.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage += 'Location information is unavailable.';
                  break;
                case error.TIMEOUT:
                  errorMessage += 'Location request timed out. Please try again.';
                  break;
                default:
                  errorMessage += 'Please ensure location services are enabled.';
              }
              
              console.error('Geolocation error:', error);
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
      console.error('Location request error:', error);
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