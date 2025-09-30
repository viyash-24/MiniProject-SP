import { useState, useEffect } from 'react';

const useStats = () => {
  const [stats, setStats] = useState({
    totalParkingAreas: 0,
    dailyActiveUsers: 0,
    totalUsers: 0,
    totalVehicles: 0,
    todayVehicles: 0,
    totalRevenue: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/stats/dashboard`);
        const data = await response.json();
        
        if (response.ok) {
          setStats(data);
        } else {
          throw new Error(data.error || 'Failed to fetch statistics');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
        // Set fallback values
        setStats({
          totalParkingAreas: 0,
          dailyActiveUsers: 0,
          totalUsers: 0,
          totalVehicles: 0,
          todayVehicles: 0,
          totalRevenue: 0,
          todayRevenue: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_URL]);

  return { stats, loading, error };
};

export default useStats;
