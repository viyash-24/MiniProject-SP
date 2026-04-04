import { Router } from 'express';
import { createVehicle, listVehicles, markPaid, exitVehicle, searchVehicles } from '../controllers/vehicles.controller.js';
import { authRequired, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const r = Router();

// Public (authenticated user) vehicle search
r.get('/search/:plate', authRequired, searchVehicles);

// User's own vehicles
r.get('/my', authRequired, asyncHandler(async (req, res) => {
  const email = req.user?.email;
  if (!email) throw new AppError(400, 'Missing user email', 'MISSING_FIELDS', { required: ['email'] });
  const { Vehicle } = await import('../models/Vehicle.js');
  // Case-insensitive match on userEmail to handle mixed-case records
  const escaped = String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const emailRegex = new RegExp(`^${escaped}$`, 'i');
  const vehicles = await Vehicle.find({ userEmail: emailRegex }).sort({ createdAt: -1 });
  res.json({ vehicles });
}));

// Register a new vehicle for the authenticated user
r.post('/my', authRequired, asyncHandler(async (req, res) => {
  const email = req.user?.email;
  if (!email) throw new AppError(400, 'Missing user email', 'MISSING_FIELDS', { required: ['email'] });
  const { Vehicle } = await import('../models/Vehicle.js');

  const { plate, vehicleType = 'Car', userName, userPhone } = req.body || {};

  const validVehicleTypes = ['Car', 'Bike', 'Truck', 'Scooter', 'Bicycle', 'Other'];
  if (!plate) throw new AppError(400, 'Plate number is required', 'MISSING_FIELDS', { required: ['plate'] });
  if (!validVehicleTypes.includes(vehicleType)) throw new AppError(400, 'Invalid vehicle type', 'INVALID_VEHICLE_TYPE');

  const upperPlate = String(plate).toUpperCase();
  const existing = await Vehicle.findOne({ plate: upperPlate, status: { $in: ['Parked', 'Paid'] } });
  if (existing) {
    throw new AppError(400, `Vehicle with plate ${upperPlate} is already parked or paid.`, 'VEHICLE_ALREADY_PARKED');
  }

  const v = await Vehicle.create({
    plate: upperPlate,
    userEmail: email,
    userName: userName || undefined,
    userPhone: userPhone || undefined,
    vehicleType,
    parkingAreaId: null,
    slotNumber: null,
    status: 'Parked',
    paymentStatus: 'Unpaid',
    createdBy: email,
  });

  res.json({ vehicle: v });
}));

// Admin-only vehicle management routes
r.use(authRequired, requireAdmin);
r.get('/', listVehicles);
r.post('/', createVehicle);
r.post('/:id/pay', markPaid);
r.post('/:id/exit', exitVehicle);

export default r;
