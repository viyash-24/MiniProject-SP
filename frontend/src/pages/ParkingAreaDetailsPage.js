import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import MapPicker from '../components/MapPicker';

const ParkingAreaDetailsPage = () => {
  const { id } = useParams();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [parkingArea, setParkingArea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  const getAuthHeader = () => {
    const headers = { 'Content-Type': 'application/json' };
    
    if (user?.email) {
      headers['x-admin-email'] = (user.email || '').toLowerCase();
    } else if (user?.email) {
      headers['x-user-email'] = (user.email || '').toLowerCase();
    }
    return headers;
  };

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to view this page.');
      navigate('/login');
      return;
    }

    const fetchParkingArea = async () => {
      setIsLoading(true);
      try {
        const endpoint = isAdmin
          ? `${API_URL}/parking-areas/${id}`
          : `${API_URL}/public/parking-areas/${id}`;
        const requestInit = isAdmin ? { headers: getAuthHeader() } : {};
        const response = await fetch(endpoint, requestInit);

        if (response.status === 401) {
          logout();
          navigate('/login');
          toast.error('Session expired. Please log in again.');
          return;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to fetch parking area details');
        }

        const normalizedParkingArea = data.parkingArea ?? data.data?.parkingArea ?? null;
        setParkingArea(normalizedParkingArea);
        setAvailableSlots(
          normalizedParkingArea?.availableSlots ??
          normalizedParkingArea?.slotAmount ??
          normalizedParkingArea?.totalSlots ??
          0
        );
      } catch (error) {
        console.error('Error fetching parking area details:', error);
        toast.error(error.message || 'Failed to fetch parking area details');
        navigate('/dashboard'); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchParkingArea();
  }, [id, user, navigate, logout, API_URL, isAdmin]);

  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!parkingArea) {
    return <div className="text-center p-8">Parking area not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{parkingArea.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        
        <div className="space-y-6">
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {(() => {
              const rawPhoto = parkingArea.photo || '';
              if (!rawPhoto) return null;

              const finalSrc = rawPhoto.startsWith('http')
                ? rawPhoto
                : `${BASE_URL}${rawPhoto.startsWith('/') ? rawPhoto : `/uploads/${rawPhoto}`}`;

              return (
                <img 
                  src={finalSrc} 
                  alt={parkingArea.name} 
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              );
            })()}
            <div 
              className={`h-64 flex items-center justify-center bg-gray-100 ${parkingArea.photo ? 'hidden' : 'flex'}`}
              style={{ display: parkingArea.photo ? 'none' : 'flex' }}
            >
              <div className="text-center text-gray-500">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm">No photo available</p>
              </div>
            </div>
          </div>

          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Parking Information</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Address:</span>
                <p className="text-gray-900">{parkingArea.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Total Slots:</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {parkingArea.slotAmount || parkingArea.totalSlots || '—'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Available Slots:</span>
                  <p className={`text-2xl font-bold ${availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {availableSlots}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                  parkingArea.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {parkingArea.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

       
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Coordinates: {parkingArea.location.latitude.toFixed(6)}, {parkingArea.location.longitude.toFixed(6)}
              </p>
            </div>
            <MapPicker 
              latitude={parkingArea.location.latitude}
              longitude={parkingArea.location.longitude}
              onLocationChange={() => {}} 
            />
          </div>

          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                View All Parking Areas
              </button>
              {parkingArea.active && availableSlots > 0 && (
                <button 
                  onClick={() => navigate('/payment')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Reserve Parking Spot
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingAreaDetailsPage;
