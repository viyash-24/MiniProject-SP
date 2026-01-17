import { Vehicle } from '../models/Vehicle.js';
import { Slot } from '../models/Slot.js';
import { Payment } from '../models/Payment.js';
import { ParkingCharge } from '../models/ParkingCharge.js';
import { ParkingArea } from '../models/ParkingArea.js';
import { nanoid } from 'nanoid';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { io } from '../index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { isValidEmail, isValidPhone, isValidPlate, normalizeEmail, normalizePhone, normalizePlate } from '../utils/validation.js';

async function sendEmail(to, subject, html) {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASS) return;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
    });
    await transporter.sendMail({ from: env.EMAIL_USER, to, subject, html });
  } catch (_) {}
}

export const listVehicles = asyncHandler(async (_req, res) => {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 });
  res.json({ vehicles });
});

export const createVehicle = asyncHandler(async (req, res) => {
  const { plate, userEmail, userName, userPhone, vehicleType = 'Car', parkingAreaId } = req.body || {};

  // Validate vehicle type
  const validVehicleTypes = ['Car', 'Bike', 'Van', 'SUV', 'Truck', 'Scooter', 'Bicycle', 'Auto', 'Three-wheeler', 'Other'];
  if (!validVehicleTypes.includes(vehicleType)) {
    throw new AppError(400, 'Invalid vehicle type', 'INVALID_VEHICLE_TYPE');
  }

  // Validate required fields
  if (!plate) throw new AppError(400, 'Plate number is required', 'MISSING_FIELDS', { required: ['plate'] });
  if (!isValidPlate(plate)) throw new AppError(400, 'Invalid plate number', 'INVALID_PLATE');

  const normalizedEmail = userEmail ? normalizeEmail(userEmail) : undefined;
  if (normalizedEmail && !isValidEmail(normalizedEmail)) {
    throw new AppError(400, 'Invalid email address', 'INVALID_EMAIL');
  }
  if (!isValidPhone(userPhone)) {
    throw new AppError(400, 'Invalid phone number', 'INVALID_PHONE');
  }
  const normalizedPhone = userPhone ? normalizePhone(userPhone) : undefined;

  // Check if vehicle with same plate already exists and is active
  const existingVehicle = await Vehicle.findOne({
    plate: normalizePlate(plate),
    status: { $in: ['Parked', 'Paid'] }
  });

  if (existingVehicle) {
    throw new AppError(
      400,
      `Vehicle with plate ${plate} is already parked. Please exit the vehicle before registering again.`,
      'VEHICLE_ALREADY_PARKED'
    );
  }

  // Find parking area and check availability
  let parkingArea = null;
  if (parkingAreaId) {
    parkingArea = await ParkingArea.findById(parkingAreaId);
    if (!parkingArea) {
      throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
    }

    // Ensure availableSlots is properly set
    if (parkingArea.availableSlots === undefined || parkingArea.availableSlots === null) {
      parkingArea.availableSlots = parkingArea.totalSlots - (parkingArea.occupiedSlots || 0);
      await parkingArea.save();
    }

    if (parkingArea.availableSlots <= 0) {
      throw new AppError(400, 'No available slots in this parking area', 'NO_AVAILABLE_SLOTS');
    }
  }

  // Calculate slot number safely
  let slotNumber = null;
  if (parkingArea && parkingArea.totalSlots && parkingArea.availableSlots !== undefined && parkingArea.availableSlots !== null && parkingArea.availableSlots > 0) {
    slotNumber = parkingArea.totalSlots - parkingArea.availableSlots + 1;
  }

  const v = await Vehicle.create({
    plate: normalizePlate(plate),
    userEmail: normalizedEmail || undefined,
    userName: userName || undefined,
    userPhone: normalizedPhone || undefined,
    vehicleType,
    parkingAreaId: parkingArea ? parkingArea._id : null,
    slotNumber: slotNumber,
    status: 'Parked',
    paymentStatus: 'Unpaid',
    createdBy: req.user?.email || 'system'
  });

  // Update parking area slot counts
  if (parkingArea) {
    parkingArea.availableSlots -= 1;
    parkingArea.occupiedSlots += 1;
    await parkingArea.save();

    // Emit socket event for parking area update
    io.emit('parkingArea:updated', {
      type: 'slot_occupied',
      parkingArea: parkingArea.toObject()
    });
  }

  res.json({ vehicle: v });
});

export const searchVehicles = asyncHandler(async (req, res) => {
  const { plate } = req.params;
  if (!plate) throw new AppError(400, 'plate is required', 'MISSING_FIELDS', { required: ['plate'] });

  const vehicles = await Vehicle.find({
    plate: { $regex: plate, $options: 'i' }
  })
    .populate('parkingAreaId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ vehicles });
});

export const markPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { method = 'Cash' } = req.body;
  const v = await Vehicle.findById(id);
  if (!v) throw new AppError(404, 'Vehicle not found', 'VEHICLE_NOT_FOUND');

  // Resolve amount from active parking charges based on vehicle type
  let amount = null;

  if (v.vehicleType) {
    const targetType = String(v.vehicleType).trim().toLowerCase();

    const charge = await ParkingCharge.findOne({
      vehicleType: new RegExp(`^${targetType}$`, 'i'),
      isActive: true
    }).lean();

    if (!charge) {
      throw new AppError(
        400,
        `No parking charge defined for vehicle type: ${v.vehicleType}. Admin must set a price before payment.`,
        'PARKING_CHARGE_NOT_FOUND'
      );
    }

    amount = Number(charge.amount);
  }

  if (!amount || amount <= 0) {
    throw new AppError(
      400,
      `Invalid parking charge amount for ${v.vehicleType}. Admin must set a valid price.`,
      'INVALID_PARKING_CHARGE'
    );
  }
  v.paymentStatus = 'Paid';
  v.status = 'Paid';
  await v.save();
  const receiptId = nanoid(10);
  const p = await Payment.create({
    vehicleId: v._id,
    userId: v.userId || undefined,
    userEmail: v.userEmail || undefined,
    userName: v.userName || undefined,
    userPhone: v.userPhone || undefined,
    vehiclePlate: v.plate,
    vehicleType: v.vehicleType,
    amount,
    method,
    status: 'Success',
    receiptId,
    paymentDate: new Date(),
  });

  // Email receipt if we have email
  if (v.userEmail) {
    await sendEmail(
      v.userEmail,
      `Parking Payment Receipt - ${v.plate}`,
      `<h3>Payment Successful</h3>
       <p>Vehicle: <b>${v.plate}</b></p>
       <p>Amount: <b>RS ${amount}</b></p>
       <p>Method: <b>${method}</b></p>
       <p>Receipt: <b>${receiptId}</b></p>`
    );
  }

  res.json({ vehicle: v, payment: p });
});

export const exitVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const v = await Vehicle.findById(id);
  if (!v) throw new AppError(404, 'Vehicle not found', 'VEHICLE_NOT_FOUND');

  // Update vehicle status
  v.status = 'Exited';
  v.exitTime = new Date();
  await v.save();

  // Update parking area slot counts if vehicle was in a parking area
  if (v.parkingAreaId) {
    const parkingArea = await ParkingArea.findById(v.parkingAreaId);
    if (parkingArea) {
      // Ensure availableSlots is properly set
      if (parkingArea.availableSlots === undefined || parkingArea.availableSlots === null) {
        parkingArea.availableSlots = parkingArea.totalSlots - (parkingArea.occupiedSlots || 0);
      }

      parkingArea.availableSlots += 1;
      parkingArea.occupiedSlots = Math.max(0, parkingArea.occupiedSlots - 1);
      await parkingArea.save();

      // Emit socket event for parking area update
      io.emit('parkingArea:updated', {
        type: 'slot_freed',
        parkingArea: parkingArea.toObject()
      });
    }
  }

  // Handle slot management for backward compatibility
  if (v.slot) {
    const s = await Slot.findById(v.slot);
    if (s) { s.isOccupied = false; await s.save(); }
  }

  res.json({ vehicle: v });
});
