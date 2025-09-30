import React, { useEffect, useState } from 'react';

const ParkingChargesDisplay = ({ compact = false }) => {
  const [parkingCharges, setParkingCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchParkingCharges = async () => {
      try {
        const response = await fetch(`${API_URL}/parking-charges/active`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setParkingCharges(data.charges || []);
        } else {
          setError('Failed to load parking charges');
        }
      } catch (err) {
        console.error('Error fetching parking charges:', err);
        setError('Failed to load parking charges');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingCharges();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || parkingCharges.length === 0) {
    return null; // Don't show anything if no charges are set
  }

  if (compact) {
    // Compact view for homepage
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <svg className="h-6 w-6 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Parking Charges</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {parkingCharges.map((charge) => (
            <div key={charge._id} className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="text-sm font-medium text-gray-900">{charge.vehicleType}</div>
              <div className="text-lg font-bold text-green-600">
                ₹{charge.amount}
                <span className="text-xs text-gray-500 ml-1">{charge.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full view for dashboard
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white">Current Parking Charges</h2>
        </div>
        <p className="text-blue-100 mt-2">Standard rates for all vehicle types</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parkingCharges.map((charge) => (
            <div key={charge._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">{charge.vehicleType}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="text-3xl font-bold text-primary mb-1">
                ₹{charge.amount}
              </div>
              <div className="text-sm text-gray-600">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {charge.duration}
                </span>
              </div>
              {charge.description && (
                <div className="mt-3 text-sm text-gray-500">
                  {charge.description}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Payment Information</p>
              <ul className="mt-1 space-y-1 text-gray-500">
                <li>• All charges are calculated based on the duration shown</li>
                <li>• Payment can be made at the exit gate or through the app</li>
                <li>• Rates are subject to change without prior notice</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingChargesDisplay;
