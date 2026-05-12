import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8 text-center text-gray-400">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
          PlotVista
        </h2>
        <p className="text-sm mb-4">The smart land & plot discovery platform.</p>
        <div className="flex justify-center space-x-6 text-sm">
          <a href="#" className="hover:text-emerald-400 transition">About Us</a>
          <a href="#" className="hover:text-emerald-400 transition">Contact</a>
          <a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a>
          <a href="#" className="hover:text-emerald-400 transition">Terms of Service</a>
        </div>
        <div className="mt-6 text-xs border-t border-gray-800 pt-4">
          &copy; {new Date().getFullYear()} PlotVista. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
