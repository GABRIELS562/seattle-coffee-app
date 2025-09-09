import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // High-quality coffee shop images from Pexels (free to use)
  const images = [
    'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1600', // Coffee being poured
    'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=1600', // Modern coffee shop interior
    'https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?auto=compress&cs=tinysrgb&w=1600', // Barista making coffee
    'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=1600', // Coffee cups on table
    'https://images.pexels.com/photos/1813466/pexels-photo-1813466.jpeg?auto=compress&cs=tinysrgb&w=1600' // Cozy coffee shop atmosphere
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // 3 seconds per slide, matching the original

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative w-full h-[70vh] sm:h-screen min-h-[400px] sm:min-h-[600px] overflow-hidden flex items-center justify-center">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className={`w-full h-full bg-cover bg-center bg-no-repeat ken-burns-zoom ${
                index === currentImageIndex ? 'ken-burns-active' : ''
              }`}
              style={{
                backgroundImage: `url(${image})`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />

      {/* Content */}
      <div className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-shadow-lg">
          Find your fix
        </h1>
        
        <div className="max-w-2xl mx-auto w-full">
          <p className="text-sm xs:text-base sm:text-xl md:text-2xl leading-relaxed text-shadow-md opacity-95 mb-6 sm:mb-8">
            Discover coffee shops across the city. From cozy neighborhood cafés to modern 
            espresso bars, find the perfect spot for your daily brew. Your favorite 
            coffee experience is just around the corner.
          </p>
          
          <button
            onClick={() => {
              document.getElementById('store-locator')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className="bg-bronze hover:bg-orange-600 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg text-base sm:text-lg transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 touch-manipulation min-h-[44px]"
            aria-label="Find your nearest store"
          >
            Find Stores
          </button>
        </div>

        {/* Scroll indicator - hide on very small screens */}
        <div 
          className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
          onClick={() => {
            document.getElementById('store-locator')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center hover:border-bronze transition-colors">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Slide indicators - make them bigger on mobile for easier tapping */}
      <div className="absolute bottom-4 right-4 z-20 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 touch-manipulation ${
              index === currentImageIndex 
                ? 'bg-white' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;