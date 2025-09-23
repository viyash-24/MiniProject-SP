import { ParkingArea } from '../models/ParkingArea.js';
import { User } from '../models/User.js';
import { Vehicle } from '../models/Vehicle.js';

export async function getDashboardStats(req, res) {
  try {
    // Get total parking areas
    const totalParkingAreas = await ParkingArea.countDocuments();
    
    // Get daily active users (users who logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dailyActiveUsers = await User.countDocuments({
      lastLogin: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total vehicles
    const totalVehicles = await Vehicle.countDocuments();
    
    // Get today's vehicle registrations
    const todayVehicles = await Vehicle.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Get total revenue (from payments)
    const { Payment } = await import('../models/Payment.js');
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'Success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Get today's revenue
    const todayRevenueResult = await Payment.aggregate([
      { 
        $match: { 
          status: 'Success',
          createdAt: {
            $gte: today,
            $lt: tomorrow
          }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;
    
    res.json({
      totalParkingAreas,
      dailyActiveUsers,
      totalUsers,
      totalVehicles,
      todayVehicles,
      totalRevenue,
      todayRevenue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}
