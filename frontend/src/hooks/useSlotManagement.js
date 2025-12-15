import { useState, useEffect } from 'react';

const useSlotManagement = () => {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [currentVehicles, setCurrentVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchParkingAreas = async () => {
    try {
      const response = await fetch(`${API_URL}/slot-management/parking-areas`);
      const data = await response.json();
      
      if (response.ok) {
        setParkingAreas(data.parkingAreas);
      } else {
        throw new Error(data.error || 'Failed to fetch parking areas');
      }
    } catch (err) {
      console.error('Error fetching parking areas:', err);
      setError(err.message);
    }
  };

  const fetchCurrentVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/slot-management/current-vehicles`);
      const data = await response.json();
      
      if (response.ok) {
        setCurrentVehicles(data.vehicles);
      } else {
        throw new Error(data.error || 'Failed to fetch current vehicles');
      }
    } catch (err) {
      console.error('Error fetching current vehicles:', err);
      setError(err.message);
    }
  };

  const getAvailableSlots = async (parkingAreaId, vehicleType) => {
    try {
      const query = vehicleType ? `?vehicleType=${encodeURIComponent(vehicleType)}` : '';
      const response = await fetch(`${API_URL}/slot-management/parking-areas/${parkingAreaId}/available-slots${query}`);
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to fetch available slots');
      }
    } catch (err) {
      console.error('Error fetching available slots:', err);
      throw err;
    }
  };

  const registerUserAndAssignSlot = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/slot-management/register-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh data after successful registration
        await Promise.all([fetchParkingAreas(), fetchCurrentVehicles()]);
        return data;
      } else {
        throw new Error(data.error || 'Failed to register user');
      }
    } catch (err) {
      console.error('Error registering user:', err);
      throw err;
    }
  };

  const exitUserAndFreeSlot = async (vehicleId, exitTime) => {
    try {
      const response = await fetch(`${API_URL}/slot-management/exit-user/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exitTime }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh data after successful exit
        await Promise.all([fetchParkingAreas(), fetchCurrentVehicles()]);
        return data;
      } else {
        throw new Error(data.error || 'Failed to exit user');
      }
    } catch (err) {
      console.error('Error exiting user:', err);
      throw err;
    }
  };

  const initializeParkingAreaSlots = async (parkingAreaId) => {
    try {
      const response = await fetch(`${API_URL}/slot-management/initialize-slots/${parkingAreaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh parking areas after successful initialization
        await fetchParkingAreas();
        return data;
      } else {
        throw new Error(data.error || 'Failed to initialize slots');
      }
    } catch (err) {
      console.error('Error initializing slots:', err);
      throw err;
    }
  };

  const recalculateSlotCounts = async (parkingAreaId) => {
    try {
      const response = await fetch(`${API_URL}/slot-management/recalculate-slots/${parkingAreaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh parking areas after successful recalculation
        await fetchParkingAreas();
        return data;
      } else {
        throw new Error(data.error || 'Failed to recalculate slots');
      }
    } catch (err) {
      console.error('Error recalculating slots:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([fetchParkingAreas(), fetchCurrentVehicles()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    parkingAreas,
    currentVehicles,
    loading,
    error,
    fetchParkingAreas,
    fetchCurrentVehicles,
    getAvailableSlots,
    registerUserAndAssignSlot,
    exitUserAndFreeSlot,
    initializeParkingAreaSlots,
    recalculateSlotCounts
  };
};

export default useSlotManagement;
