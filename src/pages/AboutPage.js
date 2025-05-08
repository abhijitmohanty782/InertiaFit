import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import amriteshKumar from "../assets/images/Amritesh_Kumar_Image.jpg";
import abhijitMohanty from "../assets/images/Abhijit_Mohanty_Image.jpg";
import arijitPal from "../assets/images/Arijit_Pal_Image.jpg";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold sm:text-5xl mb-4">
              About <span className="text-orange-500">InertiaFit AI</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
              Where fitness meets passion and results are achieved
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-300 mb-6">
                At InertiaFit AI, our mission is to provide an environment that
                inspires and motivates individuals to achieve their fitness
                goals. We believe that fitness is not just about physical
                strength but also about mental wellness and building a community
                of like-minded individuals.
              </p>
              <p className="text-gray-300">
                By transforming complex fitness science into accessible,
                actionable insights, we empower people of all backgrounds to
                achieve their optimal physical potential and build sustainable
                healthy habits that enhance their quality of life.
              </p>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Why Choose Us</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-orange-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">Pocket Personal Trainer</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-orange-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">
                    Smart Nutrition Guidance
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-orange-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">
                    Seamless User Experience
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-orange-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">Progress Visualization </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-orange-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">
                    Supportive community environment
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg group relative transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full mb-4 relative overflow-hidden">
                  <img 
                    src={amriteshKumar} 
                    alt="Amritesh Kumar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  Amritesh Kumar
                </h3>
                <p className="text-gray-300 text-center italic">
                "When your nutrition matches your dedication to training, that's when transformation happens"
                </p>
                <div className="absolute inset-0 flex items-start justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <a 
                    href="https://www.linkedin.com/in/amritesh-kumar-773b9929a/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-black hover:bg-gray-900 text-white p-3 rounded-full transition-colors duration-300 border-2 "
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg group relative transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full mb-4">
                  <img 
                    src={abhijitMohanty} 
                    alt="Abhijit Mohanty"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  Abhijit Mohanty
                </h3>
                <p className="text-gray-300 text-center italic">
                "Fitness isn't about being better than someone else. It's about being better than you used to be"
                </p>
                <div className="absolute inset-0 flex items-start justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <a 
                    href="https://www.linkedin.com/in/abhijitmohanty782/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-black hover:bg-gray-900 text-white p-3 rounded-full transition-colors duration-300 border-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg group relative transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full mb-4">
                  <img 
                    src={arijitPal} 
                    alt="Arijit Pal"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  Arijit Pal
                </h3>
                <p className="text-gray-300 text-center italic">
                "Nutrition is not about perfect. It's about effort. It's about daily choices"
                </p>
                <div className="absolute inset-0 flex items-start justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <a 
                    href="https://www.linkedin.com/in/arijit-pal-op/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-black hover:bg-gray-900 text-white p-3 rounded-full transition-colors duration-300 border-2 "
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
