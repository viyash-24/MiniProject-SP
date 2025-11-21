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
    const { name, address, location, photo, slotAmount } = req.body;
    const adminEmail = req.headers['x-admin-email'];

    if (!name || !address || !location || !slotAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!location.latitude || !location.longitude) {
      return res.status(400).json({ error: 'Location coordinates are required' });
    }

    const parkingArea = await ParkingArea.create({
      name,
      address,
      location,
      photo,
      totalSlots: slotAmount,
      availableSlots: slotAmount, // Initially all slots are available
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
    const { name, address, location, photo, slotAmount, active } = req.body;

    // If slotAmount is being updated, we need to adjust availableSlots accordingly
    const existingArea = await ParkingArea.findById(id);
    if (!existingArea) {
      return res.status(404).json({ error: 'Parking area not found' });
    }

    let updateData = { name, address, location, photo, active };

    // If slotAmount is being changed, update totalSlots and adjust availableSlots
    if (slotAmount && slotAmount !== existingArea.totalSlots) {
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

    // Calculate available slots for each parking area
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

          return {
            ...area,
            slotAmount: area.totalSlots,
            availableSlots,
            occupiedSlots
          };
        } catch (error) {
          console.error(`Error calculating slots for area ${area._id}:`, error);
          // If calculation fails, assume all slots are available
          return {
            ...area,
            slotAmount: area.totalSlots,
            availableSlots: area.totalSlots,
            occupiedSlots: 0
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

    res.json({
      success: true,
      parkingArea: {
        ...parkingArea,
        slotAmount: parkingArea.totalSlots,
        availableSlots,
        occupiedSlots
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