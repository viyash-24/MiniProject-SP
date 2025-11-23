import { Vehicle } from '../models/Vehicle.js';
import { Slot } from '../models/Slot.js';
import { Payment } from '../models/Payment.js';
import { ParkingArea } from '../models/ParkingArea.js';
import { nanoid } from 'nanoid';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { io } from '../index.js';

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

export async function listVehicles(_req, res) {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 });
  res.json({ vehicles });
}

export async function createVehicle(req, res) {
  const { plate, userEmail, userName, userPhone, vehicleType = 'Car', parkingAreaId } = req.body;

  // Validate vehicle type
  const validVehicleTypes = ['Car', 'Bike', 'Truck', 'Scooter', 'Bicycle', 'Other'];
  if (!validVehicleTypes.includes(vehicleType)) {
    return res.status(400).json({ error: 'Invalid vehicle type' });
  }

  // Validate required fields
  if (!plate) {
    return res.status(400).json({ error: 'Plate number is required' });
  }

  // Check if vehicle with same plate already exists and is active
  const existingVehicle = await Vehicle.findOne({
    plate: (plate||'').toUpperCase(),
    status: { $in: ['Parked', 'Paid'] }
  });

  if (existingVehicle) {
    return res.status(400).json({
      error: `Vehicle with plate ${plate} is already parked. Please exit the vehicle before registering again.`
    });
  }

  // Find parking area and check availability
  let parkingArea = null;
  if (parkingAreaId) {
    parkingArea = await ParkingArea.findById(parkingAreaId);
    if (!parkingArea) {
      return res.status(404).json({ error: 'Parking area not found' });
    }

    // Ensure availableSlots is properly set
    if (parkingArea.availableSlots === undefined || parkingArea.availableSlots === null) {
      parkingArea.availableSlots = parkingArea.totalSlots - (parkingArea.occupiedSlots || 0);
      await parkingArea.save();
    }

    if (parkingArea.availableSlots <= 0) {
      return res.status(400).json({ error: 'No available slots in this parking area' });
    }
  }

  // Calculate slot number safely
  let slotNumber = null;
  if (parkingArea && parkingArea.totalSlots && parkingArea.availableSlots !== undefined && parkingArea.availableSlots !== null && parkingArea.availableSlots > 0) {
    slotNumber = parkingArea.totalSlots - parkingArea.availableSlots + 1;
  }

  const v = await Vehicle.create({
    plate: (plate||'').toUpperCase(),
    userEmail: userEmail || undefined,
    userName: userName || undefined,
    userPhone: userPhone || undefined,
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
}

export async function searchVehicles(req, res) {
  const { plate } = req.params;

  try {
    // Search vehicles by plate number (case-insensitive partial match)
    const vehicles = await Vehicle.find({
      plate: { $regex: plate, $options: 'i' }
    })
    .populate('parkingAreaId', 'name')
    .sort({ createdAt: -1 })
    .limit(10); // Limit results to prevent overwhelming response

    res.json({ vehicles });
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ error: 'Failed to search vehicles' });
  }
}

export async function markPaid(req, res) {
  const { id } = req.params;
  const { amount = 50, method = 'Cash' } = req.body;
  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ error: 'Vehicle not found' });
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
}

export async function exitVehicle(req, res) {
  const { id } = req.params;
  const v = await Vehicle.findById(id);
  if (!v) return res.status(404).json({ error: 'Vehicle not found' });

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
}
