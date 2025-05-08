import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ResponsiveContainer from '../components/ResponsiveContainer';
import ResponsiveHeading from '../components/ResponsiveHeading';
import ResponsiveCard from '../components/ResponsiveCard';
import ResponsiveButton from '../components/ResponsiveButton';

/**
 * ResponsivePageTemplate - A template for creating new responsive pages
 * This serves as an example of how to use the responsive components together
 */
const ResponsivePageTemplate = () => {
  const [loading, setLoading] = useState(false);
  
  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };
  
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar />
      
      <ResponsiveContainer>
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <ResponsiveHeading level="h1" centered>
            Responsive Page Template
          </ResponsiveHeading>
          <p className="text-sm md:text-base text-gray-300 text-center mt-2">
            A demonstration of responsive components working together
          </p>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Card Example 1 */}
          <ResponsiveCard 
            title="Standard Card" 
            hover={true}
          >
            <p className="text-sm md:text-base text-gray-300 mb-4">
              This is a standard card with hover effect. It's perfect for displaying
              information in a clean, contained way.
            </p>
            <ResponsiveButton size="sm" onClick={handleClick}>
              Learn More
            </ResponsiveButton>
          </ResponsiveCard>
          
          {/* Card Example 2 */}
          <ResponsiveCard 
            title="Feature Card" 
            hover={true}
            bg="bg-gray-700"
          >
            <p className="text-sm md:text-base text-gray-300 mb-4">
              This card has a different background color. Use this for highlighting
              important information or features.
            </p>
            <ResponsiveButton 
              variant="secondary" 
              size="sm" 
              onClick={handleClick}
            >
              Explore Features
            </ResponsiveButton>
          </ResponsiveCard>
          
          {/* Card Example 3 */}
          <ResponsiveCard 
            title="Call to Action" 
            hover={true}
            className="border border-orange-500/30"
          >
            <p className="text-sm md:text-base text-gray-300 mb-4">
              This card has a custom border. Use this style for call-to-action
              or important items that need more visual emphasis.
            </p>
            <ResponsiveButton 
              variant="primary" 
              size="sm" 
              fullWidth={true}
              onClick={handleClick}
            >
              Get Started
            </ResponsiveButton>
          </ResponsiveCard>
        </div>
        
        {/* Section with Heading */}
        <div className="mt-8 md:mt-12">
          <ResponsiveHeading level="h2">
            Section Example
          </ResponsiveHeading>
          
          <ResponsiveCard className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-base md:text-lg font-medium text-orange-400 mb-2">Feature One</h3>
                <p className="text-sm md:text-base text-gray-300">
                  Description of the first feature. Keep it short and focused on benefits.
                </p>
              </div>
              
              <div>
                <h3 className="text-base md:text-lg font-medium text-orange-400 mb-2">Feature Two</h3>
                <p className="text-sm md:text-base text-gray-300">
                  Description of the second feature. Keep it short and focused on benefits.
                </p>
              </div>
              
              <div>
                <h3 className="text-base md:text-lg font-medium text-orange-400 mb-2">Feature Three</h3>
                <p className="text-sm md:text-base text-gray-300">
                  Description of the third feature. Keep it short and focused on benefits.
                </p>
              </div>
            </div>
          </ResponsiveCard>
        </div>
        
        {/* Form Example */}
        <div className="mt-8 md:mt-12 mb-8">
          <ResponsiveHeading level="h2">Form Example</ResponsiveHeading>
          
          <ResponsiveCard className="mt-4 max-w-2xl mx-auto">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input 
                  type="email"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <ResponsiveButton 
                  type="submit" 
                  loading={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick();
                  }}
                >
                  Send Message
                </ResponsiveButton>
              </div>
            </form>
          </ResponsiveCard>
        </div>
      </ResponsiveContainer>
      
      <Footer />
    </div>
  );
};

export default ResponsivePageTemplate; 