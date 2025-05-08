import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-8 md:pt-12 pb-6 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12 mb-6 md:mb-8">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-orange-500 mb-3 md:mb-4">InertiaFit AI</h3>
            <p className="text-sm md:text-base text-gray-300 mb-4">
              Transforming lives through fitness, health, and wellness. Join our community and start your fitness journey today.
            </p>
          </div>
          
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h3>
            <ul className="space-y-1 md:space-y-2">
              <li><a href="/" className="text-sm md:text-base text-gray-300 hover:text-orange-500">Home</a></li>
              <li><a href="/about" className="text-sm md:text-base text-gray-300 hover:text-orange-500">About Us</a></li>
              <li><a href="/contact" className="text-sm md:text-base text-gray-300 hover:text-orange-500">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-gray-400 text-xs md:text-sm text-center">
              &copy; 2025 InertiaFit AI. All rights reserved.
            </p> 
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 