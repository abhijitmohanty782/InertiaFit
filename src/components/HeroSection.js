import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative bg-black min-h-screen">
      {/* Hero background - ideally this would be an image of someone working out */}
      <div className="absolute inset-0 bg-black opacity-70"></div>

      {/* Hero content */}
      <div className="relative max-w-7xl mx-auto min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center space-y-8 sm:space-y-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block text-orange-500 uppercase tracking-wider mb-2">
              InertiaFit AI
            </span>
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase tracking-wider">
            <span className="block mb-2">AI fuels your grind,</span>
            <span className="block">fitness redefined!</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
            Your smart fitness companion! Using AI-driven insights, it customizes
            workouts, optimizes nutrition, and tracks progress in real time. Train
            smarter, push limits, and achieve your best with precision and ease!
          </p>
          <div className="pt-4">
            <Link
              to="/auth"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-300"
            >
              JOIN NOW
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
