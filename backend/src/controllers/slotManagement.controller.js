import { Vehicle } from '../models/Vehicle.js';
import { ParkingArea } from '../models/ParkingArea.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { isValidEmail, isValidPhone, isValidPlate, normalizeEmail, normalizePhone, normalizePlate } from '../utils/validation.js';
import { hashPassword } from '../utils/passwords.js';

const CANON_TYPES = ['Car', 'Bike', 'Van', 'Three-wheeler'];
function normalizeType(input) {
  const t = String(input || '').trim().toLowerCase();
  if (!t) return null;
  if (t === 'car') return 'Car';
  if (t === 'bike' || t === 'bicycle' || t === 'scooter') return 'Bike';
  if (t === 'van' || t === 'truck') return 'Van';
  if (t === 'suv') return 'Car';
  if (t === 'three-wheeler' || t === 'three wheeler' || t === 'auto' || t === 'rickshaw') return 'Three-wheeler';
  // fallback: if matches canon with case variations
  const canon = CANON_TYPES.find(ct => ct.toLowerCase() === t);
  return canon || null;
}

// Get all parking areas with available slots
export const getParkingAreasWithSlots = asyncHandler(async (req, res) => {
  const parkingAreas = await ParkingArea.find({ active: true })
    .select('name address totalSlots availableSlots occupiedSlots slots')
    .sort({ name: 1 });

  res.json({ parkingAreas });
});

// Get available slots for a specific parking area
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { parkingAreaId } = req.params;
  const requestedType = normalizeType(req.query.vehicleType);
  
  const parkingArea = await ParkingArea.findById(parkingAreaId)
    .select('name totalSlots availableSlots occupiedSlots slots carSlots bikeSlots vanSlots threeWheelerSlots');
  
  if (!parkingArea) {
    throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
  }

    // Auto-initialize slots if they haven't been set up yet
    if (!parkingArea.slots || parkingArea.slots.length === 0) {
      const slots = [];
      const carCount = Number(parkingArea.carSlots || 0);
      const bikeCount = Number(parkingArea.bikeSlots || 0);
      const vanCount = Number(parkingArea.vanSlots || 0);
      const threeCount = Number(parkingArea.threeWheelerSlots || 0);
      const sum = carCount + bikeCount + vanCount + threeCount;
      const total = parkingArea.totalSlots || sum || 0;

      const typedLayout = [];
      if (sum > 0) {
        typedLayout.push(...Array.from({ length: carCount }, () => 'Car'));
        typedLayout.push(...Array.from({ length: bikeCount }, () => 'Bike'));
        typedLayout.push(...Array.from({ length: vanCount }, () => 'Van'));
        typedLayout.push(...Array.from({ length: threeCount }, () => 'Three-wheeler'));
      }

      for (let i = 1; i <= total; i++) {
        const vt = typedLayout[i - 1] || 'Car';
        slots.push({
          slotNumber: i,
          isOccupied: false,
          vehicleId: null,
          occupiedAt: null,
          vehicleType: vt
        });
      }

      parkingArea.slots = slots;
      parkingArea.availableSlots = parkingArea.totalSlots;
      parkingArea.occupiedSlots = 0;
      await parkingArea.save();
    }

    // Re-sync slot occupancy with actual active vehicles to avoid any
    // stale state. This ensures that the available slots list always
    // reflects the true situation in the Vehicles collection.
    const activeVehicles = await Vehicle.find({
      parkingAreaId: parkingArea._id,
      status: { $in: ['Parked', 'Paid'] }
    }).select('slotNumber');

    const occupiedSlotNumbers = new Set(
      activeVehicles
        .filter(v => v.slotNumber != null)
        .map(v => v.slotNumber)
    );

    let occupiedCount = 0;
    for (const slot of parkingArea.slots) {
      const isOccupied = occupiedSlotNumbers.has(slot.slotNumber);
      slot.isOccupied = isOccupied;
      if (!isOccupied) {
        slot.vehicleId = null;
        slot.occupiedAt = null;
      }
      if (isOccupied) occupiedCount += 1;
    }

    parkingArea.occupiedSlots = occupiedCount;
    parkingArea.availableSlots = Math.max(
      0,
      parkingArea.totalSlots - occupiedCount
    );

    await parkingArea.save();

    // Ensure slot vehicleType alignment with per-type counts when available.
    // This doesn't change assignment logic; it only reconciles metadata for preview/validation.
    const carCount = Number(parkingArea.carSlots || 0);
    const bikeCount = Number(parkingArea.bikeSlots || 0);
    const vanCount = Number(parkingArea.vanSlots || 0);
    const threeCount = Number(parkingArea.threeWheelerSlots || 0);
    const sumTyped = carCount + bikeCount + vanCount + threeCount;

    if (sumTyped > 0 && Array.isArray(parkingArea.slots) && parkingArea.slots.length > 0) {
      // Sort by slotNumber to map consistently even when numbering doesn't start at 1
      const sorted = [...parkingArea.slots].sort((a, b) => (a.slotNumber || 0) - (b.slotNumber || 0));
      // Build desired typed layout by index
      const desired = [];
      for (let i = 0; i < carCount; i++) desired.push('Car');
      for (let i = 0; i < bikeCount; i++) desired.push('Bike');
      for (let i = 0; i < vanCount; i++) desired.push('Van');
      for (let i = 0; i < threeCount; i++) desired.push('Three-wheeler');
      while (desired.length < sorted.length) desired.push('Car'); // fallback fill

      let changed = false;
      for (let i = 0; i < sorted.length; i++) {
        const slot = sorted[i];
        const want = desired[i];
        if (!slot.isOccupied && want && normalizeType(slot.vehicleType) !== normalizeType(want)) {
          slot.vehicleType = want;
          changed = true;
        }
      }
      if (changed) {
        // Persist the reconciled types so downstream assignment validation remains consistent
        await parkingArea.save();
      }
    }

    let availableSlots = parkingArea.slots.filter(slot => !slot.isOccupied);
    if (requestedType) {
      availableSlots = availableSlots.filter(s => normalizeType(s.vehicleType) === requestedType || !s.vehicleType);
    }
    availableSlots = availableSlots
      .map(slot => ({
        slotNumber: slot.slotNumber,
        isOccupied: slot.isOccupied,
        vehicleType: slot.vehicleType || 'Car'
      }))
      .sort((a, b) => a.slotNumber - b.slotNumber);

    res.json({
      parkingArea: {
        _id: parkingArea._id,
        name: parkingArea.name,
        totalSlots: parkingArea.totalSlots,
        availableSlots: parkingArea.availableSlots
      },
      availableSlots
    });
});

// Register user and assign slot
export const registerUserAndAssignSlot = asyncHandler(async (req, res) => {
  const {
    plate,
    userEmail,
    userName,
    userPhone,
    vehicleType,
    parkingAreaId,
    slotNumber,
    createdBy
  } = req.body || {};

    // Validate required fields
    if (!plate || !userName || !userEmail || !parkingAreaId || !slotNumber) {
      throw new AppError(400, 'Missing required fields', 'MISSING_FIELDS');
    }

    const normalizedEmail = normalizeEmail(userEmail);
    if (!isValidEmail(normalizedEmail)) {
      throw new AppError(400, 'Invalid email address', 'INVALID_EMAIL');
    }
    if (!isValidPhone(userPhone)) {
      throw new AppError(400, 'Invalid phone number', 'INVALID_PHONE');
    }
    if (!isValidPlate(plate)) {
      throw new AppError(400, 'Invalid plate number', 'INVALID_PLATE');
    }
    const normalizedPhone = userPhone ? normalizePhone(userPhone) : undefined;
    const normalizedPlate = normalizePlate(plate);

    // Check if vehicle already exists and is currently parked
    const existingVehicle = await Vehicle.findOne({ 
      plate, 
      status: { $in: ['Parked', 'Paid'] } 
    });
    if (existingVehicle) {
      throw new AppError(400, 'Vehicle is already parked', 'VEHICLE_ALREADY_PARKED');
    }

    // Get parking area and check slot availability
    const parkingArea = await ParkingArea.findById(parkingAreaId);
    if (!parkingArea) {
      throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
    }

    // Check if slot is available
    const slotNo = Number(slotNumber);
    if (!Number.isFinite(slotNo) || slotNo <= 0) {
      throw new AppError(400, 'Invalid slot number', 'INVALID_SLOT_NUMBER');
    }

    const slot = parkingArea.slots.find(s => s.slotNumber === slotNo);
    if (!slot) {
      throw new AppError(400, 'Invalid slot number', 'INVALID_SLOT_NUMBER');
    }

    if (slot.isOccupied) {
      throw new AppError(400, 'Slot is already occupied', 'SLOT_OCCUPIED');
    }

    // Enforce vehicle type-slot type compatibility if slot has a type
    const normalizedVehicleType = normalizeType(vehicleType) || 'Car';
    if (slot.vehicleType) {
      const normalizedSlotType = normalizeType(slot.vehicleType) || 'Car';
      if (normalizedSlotType !== normalizedVehicleType) {
        throw new AppError(400, `Selected slot is for ${normalizedSlotType} vehicles. Please choose a matching slot.`, 'SLOT_TYPE_MISMATCH');
      }
    }

    // Check if parking area has available slots
    if (parkingArea.availableSlots <= 0) {
      throw new AppError(400, 'No available slots in this parking area', 'NO_AVAILABLE_SLOTS');
    }

    // Create or find user
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const passwordHash = await hashPassword('default123');
      user = await User.create({
        name: userName,
        email: normalizedEmail,
        phone: normalizedPhone,
        role: 'user',
        passwordHash,
      });
    }

    // Create vehicle record
    const vehicle = await Vehicle.create({
      plate: normalizedPlate,
      userId: user._id,
      userEmail: normalizedEmail,
      userName,
      userPhone: normalizedPhone,
      vehicleType: vehicleType || 'Car',
      parkingAreaId,
      slotNumber: slotNo,
      status: 'Parked',
      paymentStatus: 'Unpaid',
      createdBy
    });

    // Update parking area slot
    slot.isOccupied = true;
    slot.vehicleId = vehicle._id;
    slot.occupiedAt = new Date();
    
    // Update parking area statistics
    parkingArea.occupiedSlots += 1;
    parkingArea.availableSlots -= 1;

    await parkingArea.save();

    // Populate the response
    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('parkingAreaId', 'name address totalSlots availableSlots occupiedSlots')
      .populate('userId', 'name email phone');

    res.status(201).json({
      message: 'User and vehicle registered successfully',
      vehicle: populatedVehicle,
      parkingArea: {
        _id: parkingArea._id,
        name: parkingArea.name,
        totalSlots: parkingArea.totalSlots,
        availableSlots: parkingArea.availableSlots,
        occupiedSlots: parkingArea.occupiedSlots
      }
    });
});

// Exit user and free slot
export const exitUserAndFreeSlot = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { exitTime } = req.body || {};

    // Find the vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    
    if (!vehicle) {
      throw new AppError(404, 'Vehicle not found', 'VEHICLE_NOT_FOUND');
    }

    if (vehicle.status === 'Exited') {
      throw new AppError(400, 'Vehicle has already exited', 'VEHICLE_ALREADY_EXITED');
    }

    // Get the parking area
    const parkingArea = await ParkingArea.findById(vehicle.parkingAreaId);
    if (!parkingArea) {
      throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
    }

    // Update vehicle status
    vehicle.status = 'Exited';
    vehicle.exitTime = exitTime || new Date();
    await vehicle.save();

    // Update parking area slot - try by slotNumber first, then by vehicleId as fallback
    let slot = null;
    if (vehicle.slotNumber != null) {
      slot = parkingArea.slots.find(s => s.slotNumber === vehicle.slotNumber);
    }
    if (!slot) {
      slot = parkingArea.slots.find(s => String(s.vehicleId) === String(vehicle._id));
    }

    if (slot) {
      slot.isOccupied = false;
      slot.vehicleId = null;
      slot.occupiedAt = null;
    }

    // Update parking area statistics
    parkingArea.occupiedSlots = Math.max(0, parkingArea.occupiedSlots - 1);
    parkingArea.availableSlots = Math.min(parkingArea.totalSlots, parkingArea.availableSlots + 1);

    await parkingArea.save();

    res.json({
      message: 'User exited and slot freed successfully',
      vehicle: {
        _id: vehicle._id,
        plate: vehicle.plate,
        status: vehicle.status,
        exitTime: vehicle.exitTime
      },
      parkingArea: {
        _id: parkingArea._id,
        name: parkingArea.name,
        totalSlots: parkingArea.totalSlots,
        availableSlots: parkingArea.availableSlots,
        occupiedSlots: parkingArea.occupiedSlots
      }
    });
});

// Get current vehicles in parking
export const getCurrentVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ status: { $in: ['Parked', 'Paid'] } })
    .populate('parkingAreaId', 'name address')
    .populate('userId', 'name email phone')
    .sort({ entryTime: -1 });

  res.json({ vehicles });
});

// Initialize parking area slots
export const initializeParkingAreaSlots = asyncHandler(async (req, res) => {
  const { parkingAreaId } = req.params;

  const parkingArea = await ParkingArea.findById(parkingAreaId);
  if (!parkingArea) {
    throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
  }

    // Initialize slots array if not exists
    if (!parkingArea.slots || parkingArea.slots.length === 0) {
      const slots = [];
      for (let i = 1; i <= parkingArea.totalSlots; i++) {
        slots.push({
          slotNumber: i,
          isOccupied: false,
          vehicleId: null,
          occupiedAt: null
        });
      }
      
      parkingArea.slots = slots;
      parkingArea.availableSlots = parkingArea.totalSlots;
      parkingArea.occupiedSlots = 0;
      
      await parkingArea.save();
    }

    res.json({
      message: 'Parking area slots initialized successfully',
      parkingArea: {
        _id: parkingArea._id,
        name: parkingArea.name,
        totalSlots: parkingArea.totalSlots,
        availableSlots: parkingArea.availableSlots,
        occupiedSlots: parkingArea.occupiedSlots,
        slots: parkingArea.slots
      }
    });
});

// Recalculate slot counts for a parking area
export const recalculateSlotCounts = asyncHandler(async (req, res) => {
  const { parkingAreaId } = req.params;

  const parkingArea = await ParkingArea.findById(parkingAreaId);
  if (!parkingArea) {
    throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
  }

    // Count currently parked vehicles in this area
    const occupiedCount = await Vehicle.countDocuments({
      parkingAreaId: parkingArea._id,
      status: { $in: ['Parked', 'Paid'] }
    });

    // Update slot counts
    parkingArea.occupiedSlots = occupiedCount;
    parkingArea.availableSlots = parkingArea.totalSlots - occupiedCount;

    // Update individual slot statuses
    for (let slot of parkingArea.slots) {
      const vehicleInSlot = await Vehicle.findOne({
        parkingAreaId: parkingArea._id,
        slotNumber: slot.slotNumber,
        status: { $in: ['Parked', 'Paid'] }
      });

      slot.isOccupied = !!vehicleInSlot;
      slot.vehicleId = vehicleInSlot ? vehicleInSlot._id : null;
      slot.occupiedAt = vehicleInSlot ? vehicleInSlot.entryTime : null;
    }

    await parkingArea.save();

    res.json({
      message: 'Slot counts recalculated successfully',
      parkingArea: {
        _id: parkingArea._id,
        name: parkingArea.name,
        totalSlots: parkingArea.totalSlots,
        availableSlots: parkingArea.availableSlots,
        occupiedSlots: parkingArea.occupiedSlots
      }
    });
});
