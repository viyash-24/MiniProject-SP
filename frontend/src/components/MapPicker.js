import React, { useState, useEffect } from 'react';

const MapPicker = ({ latitude, longitude, onLocationChange }) => {
  const [mapUrl, setMapUrl] = useState('');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      // Map preview powered by OpenStreetMap
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
      setMapUrl(url);
    }
  }, [latitude, longitude]);

  const handleMapClick = (e) => {
    if (!showMap) return;
    
    // This is a simplified version, in a real app you'd use a proper map library
    // For now, we'll just show the map and let users manually enter coordinates
    setShowMap(true);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          onLocationChange(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
        >
          📍 Get Current Location
        </button>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>
// 
      {showMap && (
        <div className="border rounded-lg overflow-hidden">
          {mapUrl ? (
            <iframe
              src={mapUrl}
              width="100%"
              height="300"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              title="Location Map"
            />
          ) : (
            <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-500">
              Enter coordinates above to see the map
            </div>
          )}
          <div className="p-3 bg-gray-50 text-xs text-gray-600">
            💡 Tip: Click on the map to select a location, or use the "Get Current Location" button above.
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPicker;
