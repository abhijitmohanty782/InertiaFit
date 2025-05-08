import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Listen for changes in localStorage
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for login status changes within the app
    window.addEventListener('loginStatusChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStatusChange', handleStorageChange);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('loginStatusChange'));
    
    // Navigate to home page
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between h-14 md:h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <svg className="h-7 w-auto sm:h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white font-bold text-lg sm:text-xl ml-1 sm:ml-2">InertiaFit</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8">
              <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link to="/about" className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium">
                About
              </Link>
              <Link to="/contact" className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium">
                Contact
              </Link>
              {!isAuthenticated && (
                <Link to="/custom-nutrition" className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium">
                  Advanced Customization
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Link
                    to="/dashboard"
                    className="relative inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-orange-500 shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="relative inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-orange-500 shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <span>Sign In</span>
                </Link>
              )}
            </div>
            <div className="-mr-2 flex md:hidden ml-2">
              <button
                onClick={toggleMenu}
                className="bg-gray-700 inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-5 w-5 sm:h-6 sm:w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-5 w-5 sm:h-6 sm:w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 shadow-lg">
          <Link
            to="/"
            className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {!isAuthenticated && (
            <Link
              to="/custom-nutrition"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Advanced Customization
            </Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="text-gray-300 hover:bg-gray-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 