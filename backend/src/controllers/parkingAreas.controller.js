import { ParkingArea } from '../models/ParkingArea.js';
import { io } from '../index.js';

export async function listParkingAreas(_req, res) {
  try {
    const parkingAreas = await ParkingArea.find().sort({ createdAt: -1 });
    res.json({ parkingAreas });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking areas' });
  }
}


export async function createParkingArea(req, res) {
  try {
    const { name, address, location, photo, slotAmount, carSlots, bikeSlots, vanSlots, threeWheelerSlots } = req.body;
    const adminEmail = req.headers['x-admin-email'];

    if (!name || !address || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!location.latitude || !location.longitude) {
      return res.status(400).json({ error: 'Location coordinates are required' });
    }

    // Determine totals based on per-type counts if provided
    const c = Number(carSlots || 0);
    const b = Number(bikeSlots || 0);
    const v = Number(vanSlots || 0);
    const t = Number(threeWheelerSlots || 0);
    const sumTyped = c + b + v + t;
    const total = sumTyped > 0 ? sumTyped : Number(slotAmount || 0);

    if (!total || total <= 0) {
      return res.status(400).json({ error: 'Total slots must be greater than 0' });
    }

    const parkingArea = await ParkingArea.create({
      name,
      address,
      location,
      photo,
      carSlots: c,
      bikeSlots: b,
      vanSlots: v,
      threeWheelerSlots: t,
      totalSlots: total,
      availableSlots: total, // Initially all slots are available
      occupiedSlots: 0,
      createdBy: adminEmail
    });

    // Emit socket event for new parking area
    io.emit('parkingArea:created', {
      type: 'created',
      parkingArea: parkingArea.toObject()
    });

    res.status(201).json({ parkingArea });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create parking area' });
  }
}

export async function updateParkingArea(req, res) {
  try {
    const { id } = req.params;
    const { name, address, location, photo, slotAmount, carSlots, bikeSlots, vanSlots, threeWheelerSlots, active } = req.body;

    // If slotAmount is being updated, we need to adjust availableSlots accordingly
    const existingArea = await ParkingArea.findById(id);
    if (!existingArea) {
      return res.status(404).json({ error: 'Parking area not found' });
    }

    let updateData = { name, address, location, photo, active };

    // Decide target totals
    const hasTyped = [carSlots, bikeSlots, vanSlots, threeWheelerSlots].some(v => v !== undefined && v !== null);
    if (hasTyped) {
      const c = Number(carSlots ?? existingArea.carSlots ?? 0);
      const b = Number(bikeSlots ?? existingArea.bikeSlots ?? 0);
      const v = Number(vanSlots ?? existingArea.vanSlots ?? 0);
      const t = Number(threeWheelerSlots ?? existingArea.threeWheelerSlots ?? 0);
      const sum = c + b + v + t;
      updateData.carSlots = c;
      updateData.bikeSlots = b;
      updateData.vanSlots = v;
      updateData.threeWheelerSlots = t;
      if (sum > 0 && sum !== existingArea.totalSlots) {
        const diff = sum - existingArea.totalSlots;
        updateData.totalSlots = sum;
        updateData.availableSlots = Math.max(0, (existingArea.availableSlots ?? 0) + diff);
      }
    } else if (slotAmount && slotAmount !== existingArea.totalSlots) {
      // Fallback to legacy single total update
      const slotDifference = slotAmount - existingArea.totalSlots;
      updateData.totalSlots = slotAmount;
      updateData.availableSlots = Math.max(0, existingArea.availableSlots + slotDifference);
    }

    const parkingArea = await ParkingArea.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    // Emit socket event for updated parking area
    io.emit('parkingArea:updated', {
      type: 'updated',
      parkingArea: parkingArea.toObject()
    });

    res.json({ parkingArea });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update parking area' });
  }
}

export async function deleteParkingArea(req, res) {
  try {
    const { id } = req.params;
    const parkingArea = await ParkingArea.findByIdAndDelete(id);

    if (!parkingArea) {
      return res.status(404).json({ error: 'Parking area not found' });
    }

    // Emit socket event for deleted parking area
    io.emit('parkingArea:deleted', {
      type: 'deleted',
      parkingAreaId: id
    });

    res.json({ message: 'Parking area deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete parking area' });
  }
}

export async function getParkingArea(req, res) {
  try {
    const { id } = req.params;
    const parkingArea = await ParkingArea.findById(id);

    if (!parkingArea) {
      return res.status(404).json({ error: 'Parking area not found' });
    }

    res.json({ parkingArea });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parking area' });
  }
}

export async function listPublicParkingAreas(req, res) {
  try {
    // Parse pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Input validation
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid page number. Must be a positive integer.' 
      });
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid limit. Must be between 1 and 100.' 
      });
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

  } catch (error) {
    console.error('Error in listPublicParkingAreas:', error);
    
    // Different error handling based on error type
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching parking areas',
      requestId: req.id // Assuming you're using express-request-id or similar
    });
  }
}

export async function getPublicParkingArea(req, res) {
  try {
    const { id } = req.params;
    const parkingArea = await ParkingArea.findById(id).lean();

    if (!parkingArea || !parkingArea.active) {
      return res.status(404).json({
        success: false,
        error: 'Parking area not found or inactive'
      });
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
  } catch (error) {
    console.error('Error in getPublicParkingArea:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid parking area id',
        details: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching parking area details'
    });
  }
}