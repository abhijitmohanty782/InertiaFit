import React from 'react';
import Navbar from '../components/Navbar';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="py-10">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Contact <span className="text-orange-500">Us</span>
        </h1>
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage; 