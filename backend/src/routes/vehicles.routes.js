import { Router } from 'express';
import { createVehicle, listVehicles, markPaid, exitVehicle, searchVehicles } from '../controllers/vehicles.controller.js';
import { authRequired, requireAdmin } from '../middleware/auth.js';

const r = Router();

// Public (authenticated user) vehicle search
r.get('/search/:plate', authRequired, searchVehicles);

// User's own vehicles
r.get('/my', authRequired, async (req, res) => {
  const email = req.user?.email;
  if (!email) return res.status(400).json({ error: 'Missing user email' });
  const { Vehicle } = await import('../models/Vehicle.js');
  // Case-insensitive match on userEmail to handle mixed-case records
  const escaped = String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const emailRegex = new RegExp(`^${escaped}$`, 'i');
  const vehicles = await Vehicle.find({ userEmail: emailRegex }).sort({ createdAt: -1 });
  res.json({ vehicles });
});

// Register a new vehicle for the authenticated user
r.post('/my', authRequired, async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(400).json({ error: 'Missing user email' });
    const { Vehicle } = await import('../models/Vehicle.js');

    const { plate, vehicleType = 'Car', userName, userPhone } = req.body || {};

    // Validate
    const validVehicleTypes = ['Car', 'Bike', 'Truck', 'Scooter', 'Bicycle', 'Other'];
    if (!plate) return res.status(400).json({ error: 'Plate number is required' });
    if (!validVehicleTypes.includes(vehicleType)) return res.status(400).json({ error: 'Invalid vehicle type' });

    const upperPlate = String(plate).toUpperCase();
    const existing = await Vehicle.findOne({ plate: upperPlate, status: { $in: ['Parked', 'Paid'] } });
    if (existing) {
      return res.status(400).json({ error: `Vehicle with plate ${upperPlate} is already parked or paid.` });
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
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to register vehicle' });
  }
});

// Admin-only vehicle management routes
r.use(authRequired, requireAdmin);
r.get('/', listVehicles);
r.post('/', createVehicle);
r.post('/:id/pay', markPaid);
r.post('/:id/exit', exitVehicle);

export default r;
