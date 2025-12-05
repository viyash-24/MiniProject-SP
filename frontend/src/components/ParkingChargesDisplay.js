import React, { useEffect, useState } from 'react';
import { Car, Bike, Bus, Truck } from 'lucide-react';

const getVehicleIcon = (type = '') => {
  const key = type.toLowerCase();
  if (key.includes('car') || key.includes('suv')) return <Car className="h-5 w-5" />;
  if (key.includes('bike') || key.includes('scooter')) return <Bike className="h-5 w-5" />;
  if (key.includes('bus') || key.includes('van')) return <Bus className="h-5 w-5" />;
  return <Truck className="h-5 w-5" />;
};

const ParkingChargesDisplay = ({ compact = false, showHeading = true }) => {
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (error || parkingCharges.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${compact ? '' : 'p-6 bg-card rounded-xl border border-border shadow-sm'}`}>
      {showHeading && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">Current Parking Rates</h3>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {parkingCharges.map((charge) => (
          <div
            key={charge._id}
            className="group relative overflow-hidden rounded-xl border border-border bg-background p-4 hover:border-primary/50 hover:shadow-md transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              {getVehicleIcon(charge.vehicleType)}
            </div>
            
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground group-hover:text-primary transition-colors">
                {getVehicleIcon(charge.vehicleType)}
                <span className="text-sm font-medium uppercase tracking-wider">{charge.vehicleType}</span>
              </div>
              
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">₹{charge.amount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{charge.duration}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingChargesDisplay;
