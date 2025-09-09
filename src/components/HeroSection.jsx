import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Images from the Seattle Coffee website slideshow
  const images = [
    'https://cdn-jcbkh.nitrocdn.com/eHrJJfxhQMjgrsioXBOuZrKoZZBDtbCu/assets/images/optimized/rev-57de69f/www.seattlecoffeecompany.co.za/wp-content/uploads/2023/05/find-store-fi-1.jpg',
    'https://cdn-jcbkh.nitrocdn.com/eHrJJfxhQMjgrsioXBOuZrKoZZBDtbCu/assets/images/optimized/rev-57de69f/www.seattlecoffeecompany.co.za/wp-content/uploads/2023/04/store-caro-fi-1.jpg',
    'https://cdn-jcbkh.nitrocdn.com/eHrJJfxhQMjgrsioXBOuZrKoZZBDtbCu/assets/images/optimized/rev-57de69f/www.seattlecoffeecompany.co.za/wp-content/uploads/2023/04/store-caro-fi-2.jpg',
    'https://cdn-jcbkh.nitrocdn.com/eHrJJfxhQMjgrsioXBOuZrKoZZBDtbCu/assets/images/optimized/rev-57de69f/www.seattlecoffeecompany.co.za/wp-content/uploads/2023/04/store-caro-fi-3.jpg',
    'https://cdn-jcbkh.nitrocdn.com/eHrJJfxhQMjgrsioXBOuZrKoZZBDtbCu/assets/images/optimized/rev-57de69f/www.seattlecoffeecompany.co.za/wp-content/uploads/2023/04/store-caro-fi-4.jpg'
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
            We have café stores nationwide, as well as partnerships with FreshStop, 
            Sasol Delight, Food Lover's Market and Food Lover's Eatery. So rest assured 
            that a fix of your favourite beverage is just around the corner.
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