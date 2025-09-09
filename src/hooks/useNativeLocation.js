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
        console.log('Running on native platform, requesting permissions...');
        
        // Check current permission status first
        const checkPermissions = await Geolocation.checkPermissions();
        console.log('Current permission status:', checkPermissions);
        
        // Request permissions if not already granted
        if (checkPermissions.location !== 'granted') {
          const permissions = await Geolocation.requestPermissions();
          console.log('Native permissions response:', permissions);
          
          if (permissions.location === 'denied') {
            throw new Error('Location permission denied. Please enable location access in your device settings.');
          }
        }
        
        // Now try to get the position
        try {
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          });
          
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(location);
          setLocationLoading(false);
          return location;
        } catch (positionError) {
          console.error('Position error:', positionError);
          throw new Error('Unable to get current position. Please ensure location services are enabled.');
        }
      } else {
        // Fall back to browser geolocation API
        console.log('Running on web platform, requesting browser location...');
        
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            const error = 'Geolocation is not supported by this browser.';
            setLocationError(error);
            setLocationLoading(false);
            reject(new Error(error));
            return;
          }

          // Check if we can query permissions (not all browsers support this)
          if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
              console.log('Browser geolocation permission state:', result.state);
              
              if (result.state === 'denied') {
                const errorMessage = 'Location permission was denied. Please enable location access in your browser settings and refresh the page.';
                setLocationError(errorMessage);
                setLocationLoading(false);
                reject(new Error(errorMessage));
                return;
              }
              
              // Permission is either 'granted' or 'prompt', proceed with request
              requestBrowserLocation();
            }).catch(() => {
              // Permissions API not supported, try directly
              console.log('Permissions API not supported, requesting location directly...');
              requestBrowserLocation();
            });
          } else {
            // Permissions API not supported, try directly
            requestBrowserLocation();
          }

          function requestBrowserLocation() {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('Browser location obtained:', position.coords);
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
                    errorMessage += 'Location permission was denied. Please click "Allow" when prompted or enable location access in your browser settings.';
                    break;
                  case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable. Please check your device settings.';
                    break;
                  case error.TIMEOUT:
                    errorMessage += 'Location request timed out. Please try again.';
                    break;
                  default:
                    errorMessage += 'Please ensure location services are enabled on your device.';
                }
                
                console.error('Geolocation error:', error);
                setLocationError(errorMessage);
                setLocationLoading(false);
                reject(new Error(errorMessage));
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
              }
            );
          }
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