import { ParkingCharge } from '../models/ParkingCharge.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

// Get all parking charges
export const listParkingCharges = asyncHandler(async (req, res) => {
  const charges = await ParkingCharge.find().sort({ vehicleType: 1 });
  res.json({ success: true, charges });
});

// Get active parking charges (for users)
export const getActiveParkingCharges = asyncHandler(async (req, res) => {
  const charges = await ParkingCharge.find({ isActive: true }).sort({ vehicleType: 1 });
  res.json({ success: true, charges });
});

// Get parking charge by vehicle type
export const getParkingChargeByType = asyncHandler(async (req, res) => {
  const { vehicleType } = req.params;
  if (!vehicleType) throw new AppError(400, 'vehicleType is required', 'MISSING_FIELDS');

  const charge = await ParkingCharge.findOne({ vehicleType, isActive: true });
  if (!charge) throw new AppError(404, 'Parking charge not found for this vehicle type', 'PARKING_CHARGE_NOT_FOUND');

  res.json({ success: true, charge });
});

// Create a new parking charge
export const createParkingCharge = asyncHandler(async (req, res) => {
  const { vehicleType, amount, description, duration } = req.body || {};
  const adminEmail = req.headers['x-admin-email'] || 'admin@system.com';

  if (!vehicleType || amount === undefined || amount === null) {
    throw new AppError(400, 'vehicleType and amount are required', 'MISSING_FIELDS', { required: ['vehicleType', 'amount'] });
  }

  const existingCharge = await ParkingCharge.findOne({ vehicleType });
  if (existingCharge) throw new AppError(400, 'Parking charge already exists for this vehicle type', 'PARKING_CHARGE_EXISTS');

  const newCharge = await ParkingCharge.create({
    vehicleType,
    amount,
    description: description || `Parking charge for ${vehicleType}`,
    duration: duration || 'per hour',
    createdBy: adminEmail,
    updatedBy: adminEmail,
  });

  res.status(201).json({ success: true, charge: newCharge });
});

// Update a parking charge
export const updateParkingCharge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, description, duration, isActive } = req.body || {};
  const adminEmail = req.headers['x-admin-email'] || 'admin@system.com';

  const charge = await ParkingCharge.findById(id);
  if (!charge) throw new AppError(404, 'Parking charge not found', 'PARKING_CHARGE_NOT_FOUND');

  if (amount !== undefined) charge.amount = amount;
  if (description !== undefined) charge.description = description;
  if (duration !== undefined) charge.duration = duration;
  if (isActive !== undefined) charge.isActive = isActive;
  charge.updatedBy = adminEmail;

  await charge.save();
  res.json({ success: true, charge });
});

// Delete a parking charge
export const deleteParkingCharge = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const charge = await ParkingCharge.findById(id);
  if (!charge) throw new AppError(404, 'Parking charge not found', 'PARKING_CHARGE_NOT_FOUND');

  await ParkingCharge.findByIdAndDelete(id);
  res.json({ success: true, message: 'Parking charge deleted successfully' });
});

// Bulk update parking charges
export const bulkUpdateParkingCharges = asyncHandler(async (req, res) => {
  const { charges } = req.body || {};
  const adminEmail = req.headers['x-admin-email'] || 'admin@system.com';
  if (!Array.isArray(charges)) {
    throw new AppError(400, 'charges must be an array', 'VALIDATION_ERROR');
  }

  const results = [];
  for (const charge of charges) {
    const { vehicleType, amount, description, duration } = charge || {};
    if (!vehicleType || amount === undefined || amount === null) {
      throw new AppError(400, 'vehicleType and amount are required for each charge', 'MISSING_FIELDS');
    }

    let existingCharge = await ParkingCharge.findOne({ vehicleType });
    if (existingCharge) {
      existingCharge.amount = amount;
      existingCharge.description = description || existingCharge.description;
      existingCharge.duration = duration || existingCharge.duration;
      existingCharge.updatedBy = adminEmail;
      await existingCharge.save();
      results.push(existingCharge);
    } else {
      const newCharge = await ParkingCharge.create({
        vehicleType,
        amount,
        description: description || `Parking charge for ${vehicleType}`,
        duration: duration || 'per hour',
        createdBy: adminEmail,
        updatedBy: adminEmail,
      });
      results.push(newCharge);
    }
  }

  res.json({ success: true, charges: results });
});
