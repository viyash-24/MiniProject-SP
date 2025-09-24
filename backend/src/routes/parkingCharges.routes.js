import { Router } from 'express';
import {
  listParkingCharges,
  getActiveParkingCharges,
  getParkingChargeByType,
  createParkingCharge,
  updateParkingCharge,
  deleteParkingCharge,
  bulkUpdateParkingCharges
} from '../controllers/parkingCharges.controller.js';
import { authRequired, requireAdmin } from '../middleware/auth.js';

const r = Router();

// Public routes (for users to view charges)
r.get('/active', getActiveParkingCharges); // Get all active charges
r.get('/type/:vehicleType', getParkingChargeByType); // Get charge for specific vehicle type

// Admin routes (require authentication and admin role)
r.get('/', authRequired, requireAdmin, listParkingCharges); // Get all charges (admin)
r.post('/', authRequired, requireAdmin, createParkingCharge); // Create new charge
r.put('/:id', authRequired, requireAdmin, updateParkingCharge); // Update charge
r.delete('/:id', authRequired, requireAdmin, deleteParkingCharge); // Delete charge
r.post('/bulk', authRequired, requireAdmin, bulkUpdateParkingCharges); // Bulk update charges

export default r;
