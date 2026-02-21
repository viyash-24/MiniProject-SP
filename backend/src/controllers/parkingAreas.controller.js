import { ParkingArea } from '../models/ParkingArea.js';
import { io } from '../index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const toTrimmedString = (value) => String(value ?? '').trim();

const parseCount = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  return Number(value);
};

const validateNonNegativeInt = (n) => Number.isFinite(n) && Number.isInteger(n) && n >= 0;

const validateLat = (n) => Number.isFinite(n) && n >= -90 && n <= 90;
const validateLng = (n) => Number.isFinite(n) && n >= -180 && n <= 180;

const isValidHttpUrl = (value) => {
  const v = toTrimmedString(value);
  if (!v) return false; // Empty is invalid when required
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Helper to check if a value is provided (not empty/null/undefined)
const isProvided = (value) => value !== undefined && value !== null && value !== '';

export const listParkingAreas = asyncHandler(async (_req, res) => {
  const parkingAreas = await ParkingArea.find().sort({ createdAt: -1 });
  res.json({ parkingAreas });
});


export const createParkingArea = asyncHandler(async (req, res) => {
  const { name, address, location, photo, slotAmount, totalSlots, carSlots, bikeSlots, vanSlots, threeWheelerSlots } = req.body || {};
  const adminEmail = req.headers['x-admin-email'];

  const trimmedName = toTrimmedString(name);
  const trimmedAddress = toTrimmedString(address);
  const trimmedPhoto = toTrimmedString(photo);

  if (!adminEmail) {
    throw new AppError(401, 'Missing admin identity', 'MISSING_ADMIN_EMAIL');
  }

  // Collect all missing required fields
  const missingFields = [];
  if (!trimmedName) missingFields.push('name');
  if (!trimmedAddress) missingFields.push('address');
  if (!location) missingFields.push('location');
  if (!isProvided(location?.latitude)) missingFields.push('location.latitude');
  if (!isProvided(location?.longitude)) missingFields.push('location.longitude');
  if (!trimmedPhoto) missingFields.push('photo');
  if (!isProvided(carSlots)) missingFields.push('carSlots');
  if (!isProvided(bikeSlots)) missingFields.push('bikeSlots');
  if (!isProvided(vanSlots)) missingFields.push('vanSlots');
  if (!isProvided(threeWheelerSlots)) missingFields.push('threeWheelerSlots');

  if (missingFields.length > 0) {
    throw new AppError(400, 'All fields are required', 'MISSING_FIELDS', { required: missingFields });
  }

  const lat = Number(location.latitude);
  const lng = Number(location.longitude);
  if (!validateLat(lat)) {
    throw new AppError(400, 'Latitude must be between -90 and 90', 'INVALID_LATITUDE');
  }
  if (!validateLng(lng)) {
    throw new AppError(400, 'Longitude must be between -180 and 180', 'INVALID_LONGITUDE');
  }

  if (!isValidHttpUrl(trimmedPhoto)) {
    throw new AppError(400, 'Photo must be a valid http/https URL', 'INVALID_PHOTO_URL');
  }

  const c = parseCount(carSlots);
  const b = parseCount(bikeSlots);
  const v = parseCount(vanSlots);
  const t = parseCount(threeWheelerSlots);
  const fieldErrors = {};
  if (!validateNonNegativeInt(c)) fieldErrors.carSlots = 'Car slots must be a whole number >= 0';
  if (!validateNonNegativeInt(b)) fieldErrors.bikeSlots = 'Bike slots must be a whole number >= 0';
  if (!validateNonNegativeInt(v)) fieldErrors.vanSlots = 'Van slots must be a whole number >= 0';
  if (!validateNonNegativeInt(t)) fieldErrors.threeWheelerSlots = 'Three-wheeler slots must be a whole number >= 0';
  if (Object.keys(fieldErrors).length > 0) {
    throw new AppError(400, 'Invalid slot counts', 'INVALID_SLOT_COUNTS', { fields: fieldErrors });
  }

  const sumTyped = c + b + v + t;
  const totalCandidate = sumTyped > 0 ? sumTyped : Number(slotAmount ?? totalSlots ?? 0);
  if (!Number.isFinite(totalCandidate) || !Number.isInteger(totalCandidate) || totalCandidate <= 0) {
    throw new AppError(400, 'Total slots must be a whole number greater than 0', 'INVALID_TOTAL_SLOTS');
  }

  const parkingArea = await ParkingArea.create({
    name: trimmedName,
    address: trimmedAddress,
    location: { latitude: lat, longitude: lng },
    photo: trimmedPhoto,
    carSlots: c,
    bikeSlots: b,
    vanSlots: v,
    threeWheelerSlots: t,
    totalSlots: totalCandidate,
    availableSlots: totalCandidate, // Initially all slots are available
    occupiedSlots: 0,
    createdBy: adminEmail
  });

    // Emit socket event for new parking area
    io.emit('parkingArea:created', {
      type: 'created',
      parkingArea: parkingArea.toObject()
    });

    res.status(201).json({ parkingArea });
});

export const updateParkingArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, address, location, photo, slotAmount, totalSlots, carSlots, bikeSlots, vanSlots, threeWheelerSlots, active } = req.body || {};

    // If slotAmount is being updated, we need to adjust availableSlots accordingly
    const existingArea = await ParkingArea.findById(id);
    if (!existingArea) {
      throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
    }

    const updateData = {};

    if (name !== undefined) {
      const trimmed = toTrimmedString(name);
      if (!trimmed) throw new AppError(400, 'Area name is required', 'MISSING_FIELDS', { required: ['name'] });
      updateData.name = trimmed;
    }

    if (address !== undefined) {
      const trimmed = toTrimmedString(address);
      if (!trimmed) throw new AppError(400, 'Address is required', 'MISSING_FIELDS', { required: ['address'] });
      updateData.address = trimmed;
    }

    if (photo !== undefined) {
      const trimmed = toTrimmedString(photo);
      if (trimmed && !isValidHttpUrl(trimmed)) {
        throw new AppError(400, 'Photo must be a valid http/https URL', 'INVALID_PHOTO_URL');
      }
      updateData.photo = trimmed || '';
    }

    if (location !== undefined) {
      const lat = Number(location?.latitude);
      const lng = Number(location?.longitude);
      if (location?.latitude === undefined || location?.latitude === null || location?.latitude === '' ||
          location?.longitude === undefined || location?.longitude === null || location?.longitude === '') {
        throw new AppError(400, 'Location coordinates are required', 'MISSING_FIELDS', { required: ['location.latitude', 'location.longitude'] });
      }
      if (!validateLat(lat)) {
        throw new AppError(400, 'Latitude must be between -90 and 90', 'INVALID_LATITUDE');
      }
      if (!validateLng(lng)) {
        throw new AppError(400, 'Longitude must be between -180 and 180', 'INVALID_LONGITUDE');
      }
      updateData.location = { latitude: lat, longitude: lng };
    }

    if (active !== undefined) updateData.active = Boolean(active);

    // Decide target totals
    const desiredTotalRaw = slotAmount ?? totalSlots;
    const hasTyped = [carSlots, bikeSlots, vanSlots, threeWheelerSlots].some(v => v !== undefined && v !== null);

    let nextTotal = undefined;
    let nextTypedSum = undefined;

    if (hasTyped) {
      const c = parseCount(carSlots ?? existingArea.carSlots ?? 0);
      const b = parseCount(bikeSlots ?? existingArea.bikeSlots ?? 0);
      const v = parseCount(vanSlots ?? existingArea.vanSlots ?? 0);
      const t = parseCount(threeWheelerSlots ?? existingArea.threeWheelerSlots ?? 0);
      const fieldErrors = {};
      if (!validateNonNegativeInt(c)) fieldErrors.carSlots = 'Car slots must be a whole number >= 0';
      if (!validateNonNegativeInt(b)) fieldErrors.bikeSlots = 'Bike slots must be a whole number >= 0';
      if (!validateNonNegativeInt(v)) fieldErrors.vanSlots = 'Van slots must be a whole number >= 0';
      if (!validateNonNegativeInt(t)) fieldErrors.threeWheelerSlots = 'Three-wheeler slots must be a whole number >= 0';
      if (Object.keys(fieldErrors).length > 0) {
        throw new AppError(400, 'Invalid slot counts', 'INVALID_SLOT_COUNTS', { fields: fieldErrors });
      }

      updateData.carSlots = c;
      updateData.bikeSlots = b;
      updateData.vanSlots = v;
      updateData.threeWheelerSlots = t;
      nextTypedSum = c + b + v + t;
      if (nextTypedSum > 0) nextTotal = nextTypedSum;
    }

    if (nextTotal === undefined && desiredTotalRaw !== undefined && desiredTotalRaw !== null && desiredTotalRaw !== '') {
      const candidate = Number(desiredTotalRaw);
      if (!Number.isFinite(candidate) || !Number.isInteger(candidate) || candidate <= 0) {
        throw new AppError(400, 'Total slots must be a whole number greater than 0', 'INVALID_TOTAL_SLOTS');
      }
      nextTotal = candidate;
    }

    if (nextTotal !== undefined && nextTotal !== existingArea.totalSlots) {
      const occupied = Number.isFinite(Number(existingArea.occupiedSlots))
        ? Number(existingArea.occupiedSlots)
        : Math.max(0, Number(existingArea.totalSlots || 0) - Number(existingArea.availableSlots || 0));

      if (nextTotal < occupied) {
        throw new AppError(400, `Total slots cannot be less than occupied slots (${occupied})`, 'INVALID_TOTAL_SLOTS');
      }
      updateData.totalSlots = nextTotal;
      updateData.availableSlots = Math.max(0, nextTotal - occupied);
    } else if (hasTyped && nextTypedSum !== undefined && nextTypedSum <= 0 && desiredTotalRaw === undefined) {
      // If they explicitly set typed counts but sum is 0, require a total.
      throw new AppError(400, 'Provide total slots or per-type counts > 0', 'INVALID_TOTAL_SLOTS');
    }

    const parkingArea = await ParkingArea.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!parkingArea) {
      throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
    }

    // Emit socket event for updated parking area
    io.emit('parkingArea:updated', {
      type: 'updated',
      parkingArea: parkingArea.toObject()
    });

    res.json({ parkingArea });
});

export const deleteParkingArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const parkingArea = await ParkingArea.findByIdAndDelete(id);

    if (!parkingArea) {
      throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
    }

    // Emit socket event for deleted parking area
    io.emit('parkingArea:deleted', {
      type: 'deleted',
      parkingAreaId: id
    });

    res.json({ message: 'Parking area deleted successfully' });
});

export const getParkingArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const parkingArea = await ParkingArea.findById(id);

    if (!parkingArea) {
      throw new AppError(404, 'Parking area not found', 'PARKING_AREA_NOT_FOUND');
    }

    res.json({ parkingArea });
});

export const listPublicParkingAreas = asyncHandler(async (req, res) => {
  // Parse pagination parameters with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

    // Input validation
    if (isNaN(page) || page < 1) {
      throw new AppError(400, 'Invalid page number. Must be a positive integer.', 'VALIDATION_ERROR');
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new AppError(400, 'Invalid limit. Must be between 1 and 100.', 'VALIDATION_ERROR');
    }

    // Get total count for pagination
    const total = await ParkingArea.countDocuments({ active: true });
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const parkingAreas = await ParkingArea
      .find({ active: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JS objects

    // Calculate available slots (total and per vehicle type) for each parking area
    const parkingAreasWithSlots = await Promise.all(
      parkingAreas.map(async (area) => {
        try {
          // Count vehicles that are currently parked or paid (occupied slots)
          const Vehicle = (await import('../models/Vehicle.js')).Vehicle;
          const occupiedSlots = await Vehicle.countDocuments({
            parkingAreaId: area._id,
            status: { $in: ['Parked', 'Paid'] }
          });

          const availableSlots = Math.max(0, area.totalSlots - occupiedSlots);

          // Per-type availability
          const totals = {
            Car: Number(area.carSlots || 0),
            Bike: Number(area.bikeSlots || 0),
            Van: Number(area.vanSlots || 0),
            'Three-wheeler': Number(area.threeWheelerSlots || 0)
          };
          const occupiedByTypeAgg = await Vehicle.aggregate([
            { $match: { parkingAreaId: area._id, status: { $in: ['Parked', 'Paid'] } } },
            { $group: { _id: { $toLower: '$vehicleType' }, count: { $sum: 1 } } }
          ]);
          const occupiedByType = occupiedByTypeAgg.reduce((acc, cur) => {
            const key = (cur._id || '').toLowerCase();
            const map = { car: 'Car', suv: 'Car', bike: 'Bike', scooter: 'Bike', van: 'Van', truck: 'Van', 'three-wheeler': 'Three-wheeler', auto: 'Three-wheeler' };
            const type = map[key] || 'Other';
            if (type !== 'Other') acc[type] = (acc[type] || 0) + cur.count;
            return acc;
          }, {});
          const availableByType = {
            car: Math.max(0, (totals.Car || 0) - (occupiedByType['Car'] || 0)),
            bike: Math.max(0, (totals.Bike || 0) - (occupiedByType['Bike'] || 0)),
            van: Math.max(0, (totals.Van || 0) - (occupiedByType['Van'] || 0)),
            threeWheeler: Math.max(0, (totals['Three-wheeler'] || 0) - (occupiedByType['Three-wheeler'] || 0))
          };

          return {
            ...area,
            slotAmount: area.totalSlots,
            availableSlots,
            occupiedSlots,
            availableByType
          };
        } catch (error) {
          console.error(`Error calculating slots for area ${area._id}:`, error);
          // If calculation fails, assume all slots are available
          return {
            ...area,
            slotAmount: area.totalSlots,
            availableSlots: area.totalSlots,
            occupiedSlots: 0,
            availableByType: { car: Number(area.carSlots||0), bike: Number(area.bikeSlots||0), van: Number(area.vanSlots||0), threeWheeler: Number(area.threeWheelerSlots||0) }
          };
        }
      })
    );

    // Add pagination metadata
    const response = {
      success: true,
      data: parkingAreasWithSlots,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };

    res.json(response);
});

export const getPublicParkingArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const parkingArea = await ParkingArea.findById(id).lean();

    if (!parkingArea || !parkingArea.active) {
      throw new AppError(404, 'Parking area not found or inactive', 'PARKING_AREA_NOT_FOUND');
    }

    const Vehicle = (await import('../models/Vehicle.js')).Vehicle;
    const occupiedSlots = await Vehicle.countDocuments({
      parkingAreaId: parkingArea._id,
      status: { $in: ['Parked', 'Paid'] }
    });

    const availableSlots = Math.max(0, parkingArea.totalSlots - occupiedSlots);

    // Per-type availability for single area
    const totals = {
      Car: Number(parkingArea.carSlots || 0),
      Bike: Number(parkingArea.bikeSlots || 0),
      Van: Number(parkingArea.vanSlots || 0),
      'Three-wheeler': Number(parkingArea.threeWheelerSlots || 0)
    };
    const occupiedByTypeAgg = await Vehicle.aggregate([
      { $match: { parkingAreaId: parkingArea._id, status: { $in: ['Parked', 'Paid'] } } },
      { $group: { _id: { $toLower: '$vehicleType' }, count: { $sum: 1 } } }
    ]);
    const occupiedByType = occupiedByTypeAgg.reduce((acc, cur) => {
      const key = (cur._id || '').toLowerCase();
      const map = { car: 'Car', suv: 'Car', bike: 'Bike', scooter: 'Bike', van: 'Van', truck: 'Van', 'three-wheeler': 'Three-wheeler', auto: 'Three-wheeler' };
      const type = map[key] || 'Other';
      if (type !== 'Other') acc[type] = (acc[type] || 0) + cur.count;
      return acc;
    }, {});
    const availableByType = {
      car: Math.max(0, (totals.Car || 0) - (occupiedByType['Car'] || 0)),
      bike: Math.max(0, (totals.Bike || 0) - (occupiedByType['Bike'] || 0)),
      van: Math.max(0, (totals.Van || 0) - (occupiedByType['Van'] || 0)),
      threeWheeler: Math.max(0, (totals['Three-wheeler'] || 0) - (occupiedByType['Three-wheeler'] || 0))
    };

    res.json({
      success: true,
      parkingArea: {
        ...parkingArea,
        slotAmount: parkingArea.totalSlots,
        availableSlots,
        occupiedSlots,
        availableByType
      }
    });
});