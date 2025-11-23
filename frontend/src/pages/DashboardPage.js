import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function DashboardPage() {
  const { user } = useAuth();
  const [parkingAreas, setParkingAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [pagination, setPagination] = useState({});

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchParkingAreas = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_URL}/public/parking-areas?page=${page}&limit=${limit}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch parking areas');
      }
      
      // Update state with paginated data
      setParkingAreas(data.data || []);
      
      // Store pagination info if needed
      if (data.pagination) {
        setPagination({
          currentPage: data.pagination.page,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.total,
          hasNextPage: data.pagination.hasNextPage,
          hasPreviousPage: data.pagination.hasPreviousPage
        });
      }
      
    } catch (error) {
      console.error('Error fetching parking areas:', error);
      setError(error.message || 'Failed to load parking areas. Please try again.');
      setParkingAreas([]);
      toast.error(error.message || 'Failed to load parking areas. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to retrieve your location. Distance information will not be available.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }

    // Fetch parking areas
    fetchParkingAreas();
  }, [fetchParkingAreas]);

  // Calculate distance between two points in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Sort parking areas by distance if location is available
  const sortedParkingAreas = useMemo(() => {
    if (!userLocation) return parkingAreas;
    
    return [...parkingAreas].sort((a, b) => {
      const distA = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        a.location?.latitude, 
        a.location?.longitude
      );
      const distB = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        b.location?.latitude, 
        b.location?.longitude
      );
      return (distA || Infinity) - (distB || Infinity);
    });
  }, [parkingAreas, userLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center page-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">Loading parking areas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 page-fade-in">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={fetchParkingAreas}
            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded btn-soft"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 dark:bg-slate-950 page-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Available Parking Areas</h1>
        {user?.role === 'admin' && (
          <Link
            to="/admin/parking-areas"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 btn-soft"
          >
            Manage Parking Areas
          </Link>
        )}
      </div>

      {locationError && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950/40 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200">
          <p>{locationError}</p>
        </div>
      )}
      
      {parkingAreas.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-slate-50">No parking areas available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            There are currently no parking areas listed. Please check back later.
          </p>
          {user?.role === 'admin' && (
            <div className="mt-6">
              <Link
                to="/admin/parking-areas"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 btn-soft"
              >
                Add New Parking Area
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedParkingAreas.map((area) => {
            const distance = userLocation && area.location?.latitude && area.location?.longitude
              ? calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  area.location.latitude,
                  area.location.longitude
                )
              : null;

            return (
              <div key={area._id} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-200 flex flex-col card-elevated">
                {/* Photo Section */}
                <div className="h-48 bg-gray-100 relative overflow-hidden rounded-t-2xl">
                  {area.photo ? (
                    <img 
                      src={area.photo} 
                      alt={area.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`absolute inset-0 flex items-center justify-center ${area.photo ? 'hidden' : 'flex'}`}
                    style={{ display: area.photo ? 'none' : 'flex' }}
                  >
                    <div className="text-center text-gray-500">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
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

                {/* Content Section */}
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4m0 0V3h4m-4 4a4 4 0 004 4m12-4h-4v4m4-4a4 4 0 00-4-4m0 16h4v-4m-4 4a4 4 0 01-4-4m-4 4h4v-4m-4 4a4 4 0 01-4-4m-4 4h4v-4m-4 4a4 4 0 004 4"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
                          {area.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-slate-50">
                            {area.availableSlots || 0} / {area.slotAmount || 0} slots available
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/80 px-5 py-3 border-t border-gray-100 dark:border-slate-800 mt-auto">
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 dark:text-slate-200">
                      {area.address}
                    </div>
                    {distance !== null && (
                      <div className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {distance} km away
                      </div>
                    )}
                    <div className="mt-2">
                      <Link
                        to={`/parking/${area._id}`}
                        className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium text-sm"
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
