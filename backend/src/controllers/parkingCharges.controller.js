import { ParkingCharge } from '../models/ParkingCharge.js';

// Get all parking charges
export async function listParkingCharges(req, res) {
  try {
    const charges = await ParkingCharge.find().sort({ vehicleType: 1 });
    res.json({ success: true, charges });
  } catch (error) {
    console.error('Error fetching parking charges:', error);
    res.status(500).json({ error: 'Failed to fetch parking charges' });
  }
}

// Get active parking charges (for users)
export async function getActiveParkingCharges(req, res) {
  try {
    const charges = await ParkingCharge.find({ isActive: true }).sort({ vehicleType: 1 });
    res.json({ success: true, charges });
  } catch (error) {
    console.error('Error fetching active parking charges:', error);
    res.status(500).json({ error: 'Failed to fetch parking charges' });
  }
}

// Get parking charge by vehicle type
export async function getParkingChargeByType(req, res) {
  try {
    const { vehicleType } = req.params;
    const charge = await ParkingCharge.findOne({ vehicleType, isActive: true });
    
    if (!charge) {
      return res.status(404).json({ error: 'Parking charge not found for this vehicle type' });
    }
    
    res.json({ success: true, charge });
  } catch (error) {
    console.error('Error fetching parking charge:', error);
    res.status(500).json({ error: 'Failed to fetch parking charge' });
  }
}

// Create a new parking charge
export async function createParkingCharge(req, res) {
  try {
    const { vehicleType, amount, description, duration } = req.body;
    const adminEmail = req.headers['x-admin-email'] || 'admin@system.com';

    // Check if charge already exists for this vehicle type
    const existingCharge = await ParkingCharge.findOne({ vehicleType });
    if (existingCharge) {
      return res.status(400).json({ error: 'Parking charge already exists for this vehicle type' });
    }

    const newCharge = await ParkingCharge.create({
      vehicleType,
      amount,
      description: description || `Parking charge for ${vehicleType}`,
      duration: duration || 'per hour',
      createdBy: adminEmail,
      updatedBy: adminEmail,
    });

    res.status(201).json({ success: true, charge: newCharge });
  } catch (error) {
    console.error('Error creating parking charge:', error);
    res.status(500).json({ error: error.message || 'Failed to create parking charge' });
  }
}

// Update a parking charge
export async function updateParkingCharge(req, res) {
  try {
    const { id } = req.params;
    const { amount, description, duration, isActive } = req.body;
    const adminEmail = req.headers['x-admin-email'] || 'admin@system.com';

    const charge = await ParkingCharge.findById(id);
    if (!charge) {
      return res.status(404).json({ error: 'Parking charge not found' });
    }

    // Update fields
    if (amount !== undefined) charge.amount = amount;
    if (description !== undefined) charge.description = description;
    if (duration !== undefined) charge.duration = duration;
    if (isActive !== undefined) charge.isActive = isActive;
    charge.updatedBy = adminEmail;

    await charge.save();

    res.json({ success: true, charge });
  } catch (error) {
    console.error('Error updating parking charge:', error);
    res.status(500).json({ error: error.message || 'Failed to update parking charge' });
  }
}

// Delete a parking charge
export async function deleteParkingCharge(req, res) {
  try {
    const { id } = req.params;

    const charge = await ParkingCharge.findById(id);
    if (!charge) {
      return res.status(404).json({ error: 'Parking charge not found' });
    }

    await ParkingCharge.findByIdAndDelete(id);

    res.json({ success: true, message: 'Parking charge deleted successfully' });
  } catch (error) {
    console.error('Error deleting parking charge:', error);
    res.status(500).json({ error: 'Failed to delete parking charge' });
  }
}

// Bulk update parking charges
export async function bulkUpdateParkingCharges(req, res) {
  try {
    const { charges } = req.body;
    const adminEmail = req.headers['x-admin-email'] || 'admin@system.com';
    const results = [];

    for (const charge of charges) {
      const { vehicleType, amount, description, duration } = charge;
      
      // Check if charge exists
      let existingCharge = await ParkingCharge.findOne({ vehicleType });
      
      if (existingCharge) {
        // Update existing charge
        existingCharge.amount = amount;
        existingCharge.description = description || existingCharge.description;
        existingCharge.duration = duration || existingCharge.duration;
        existingCharge.updatedBy = adminEmail;
        await existingCharge.save();
        results.push(existingCharge);
      } else {
        // Create new charge
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
  } catch (error) {
    console.error('Error bulk updating parking charges:', error);
    res.status(500).json({ error: 'Failed to bulk update parking charges' });
  }
}
