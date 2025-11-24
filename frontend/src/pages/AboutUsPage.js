import React from 'react';
import { Link } from 'react-router-dom';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 page-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-50 mb-4">About Smart Parking</h1>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
            Transforming urban parking with intelligent technology solutions
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 mb-8 card-elevated">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-slate-300 mb-6">
              Smart Parking is dedicated to revolutionizing the way people find, reserve, and pay for parking in busy urban areas.
              We leverage cutting-edge technology to make parking hassle-free, reducing time spent searching for spots and improving
              the overall urban mobility experience.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-4 mt-8">What We Do</h2>
            <p className="text-gray-700 dark:text-slate-300 mb-4">
              Our platform provides real-time parking availability information, allowing drivers to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Find available parking spaces in real-time</li>
              <li>View parking area details including location and pricing</li>
              <li>Make secure online payments</li>
              <li>Manage parking sessions efficiently</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Why Choose Us</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl p-6 card-elevated">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">Fast & Efficient</h3>
                <p className="text-gray-600 dark:text-slate-300">Find parking in seconds with our real-time availability system</p>
              </div>

              <div className="bg-green-50/80 dark:bg-green-950/40 rounded-2xl p-6 card-elevated">
                <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">Secure Payments</h3>
                <p className="text-gray-600 dark:text-slate-300">All transactions are encrypted and processed securely</p>
              </div>

              <div className="bg-purple-50/80 dark:bg-purple-950/40 rounded-2xl p-6 card-elevated">
                <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-50 mb-2">24/7 Support</h3>
                <p className="text-gray-600 dark:text-slate-300">Our support team is always ready to help you</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-4 mt-8">Our Vision</h2>
            <p className="text-gray-700 dark:text-slate-300 mb-6">
              We envision a future where finding parking is no longer a source of stress for drivers. Through smart technology
              and innovative solutions, we aim to create smarter cities with improved traffic flow, reduced emissions, and
              enhanced quality of life for urban residents.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full shadow-md shadow-blue-500/30 btn-soft"
          >
            Start Using Smart Parking
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
