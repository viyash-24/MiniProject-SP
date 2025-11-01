import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAdmin } = useAuth();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">SP</span>
              <span className="text-lg font-semibold text-gray-800">Smart Parking</span>
            </div>
            <p className="text-sm text-gray-600">Find, park, and pay effortlessly in busy city areas.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {!isAdmin && <li><Link to="/dashboard" className="hover:text-primary">Parking Finder</Link></li>}
              {!isAdmin && <li><Link to="/payment" className="hover:text-primary">Payments</Link></li>}
              {isAdmin && <li><Link to="/admin" className="hover:text-primary">Admin</Link></li>}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {!isAdmin && <li><Link to="/" className="hover:text-primary">About</Link></li>}
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Get the App</h4>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-black text-white text-xs rounded-md">App Store</button>
              <button className="px-3 py-2 bg-black text-white text-xs rounded-md">Google Play</button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between">
          <p> {new Date().getFullYear()} Smart Parking. All rights reserved.</p>
          <div className="space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
