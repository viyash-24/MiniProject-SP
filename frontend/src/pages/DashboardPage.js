import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Search, MapPin, Navigation, Car, AlertCircle, Loader2, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';

function DashboardPage() {
  const { user } = useAuth();
  const [parkingAreas, setParkingAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('distance'); // distance, slots

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  const fetchParkingAreas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/public/parking-areas?limit=100`);
      const data = await response.json();
      
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to fetch');
      setParkingAreas(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load parking areas.');
      toast.error('Failed to load parking areas.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error('Location error:', err)
      );
    }
    fetchParkingAreas();
  }, [fetchParkingAreas]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const sortedParkingAreas = useMemo(() => {
    let areas = [...parkingAreas];
    
    // Filter
    if (searchTerm) {
      areas = areas.filter(area => 
        area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Add distance
    if (userLocation) {
      areas = areas.map(area => ({
        ...area,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          area.location?.coordinates?.[1] || area.latitude,
          area.location?.coordinates?.[0] || area.longitude
        )
      }));
    }

    // Sort
    areas.sort((a, b) => {
      if (sortBy === 'distance' && userLocation) {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return parseFloat(a.distance) - parseFloat(b.distance);
      }
      if (sortBy === 'slots') {
        const slotsA = a.availableSlots !== undefined ? a.availableSlots : a.totalSlots;
        const slotsB = b.availableSlots !== undefined ? b.availableSlots : b.totalSlots;
        return slotsB - slotsA; // Most slots first
      }
      return 0;
    });
    
    return areas;
  }, [parkingAreas, userLocation, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Finding parking spots nearby...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-bold text-destructive mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={fetchParkingAreas} variant="outline">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Find Parking</h1>
            <p className="text-muted-foreground">Discover available spots near you.</p>
          </div>
          {user?.role === 'admin' && (
            <Button asChild>
              <Link to="/admin/parking-areas">Manage Areas</Link>
            </Button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={sortBy === 'distance' ? 'default' : 'outline'}
              onClick={() => setSortBy('distance')}
              className="flex-1 md:flex-none"
              disabled={!userLocation}
            >
              <Navigation className="mr-2 h-4 w-4" /> Near Me
            </Button>
            <Button 
              variant={sortBy === 'slots' ? 'default' : 'outline'}
              onClick={() => setSortBy('slots')}
              className="flex-1 md:flex-none"
            >
              <Filter className="mr-2 h-4 w-4" /> Most Slots
            </Button>
          </div>
        </div>

        {/* Location Warning */}
        {locationError && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3 text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{locationError}</p>
          </div>
        )}

        {/* Grid */}
        {sortedParkingAreas.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted/30 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <Car className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No parking areas found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedParkingAreas.map((area, index) => (
              <motion.div
                key={area._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  {(() => {
                    const rawPhoto = area.photo || '';
                    if (!rawPhoto) return null;

                    const finalSrc = rawPhoto.startsWith('http')
                      ? rawPhoto
                      : `${BASE_URL}${rawPhoto.startsWith('/') ? rawPhoto : `/uploads/${rawPhoto}`}`;

                    return (
                      <img 
                        src={finalSrc} 
                        alt={area.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    );
                  })()}
                  <div 
                    className={`absolute inset-0 flex items-center justify-center bg-muted ${area.photo ? 'hidden' : 'flex'}`}
                    style={{ display: area.photo ? 'none' : 'flex' }}
                  >
                    <Car className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  
                  {/* Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-md ${
                      (area.availableSlots || 0) > 5 
                        ? 'bg-green-500/90 text-white' 
                        : (area.availableSlots || 0) > 0 
                          ? 'bg-yellow-500/90 text-white' 
                          : 'bg-red-500/90 text-white'
                    }`}>
                      {area.availableSlots || 0} Slots Left
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">{area.name}</h3>
                    {area.distance && (
                      <span className="flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        <Navigation className="h-3 w-3 mr-1" />
                        {area.distance} km
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2 text-muted-foreground text-sm mb-4 flex-1">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{area.address}</span>
                  </div>

                  <div className="pt-4 border-t border-border mt-auto">
                    <Button asChild className="w-full group-hover:bg-primary/90">
                      <Link to={`/parking/${area._id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
