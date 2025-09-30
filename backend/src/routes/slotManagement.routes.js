import express from 'express';
import {
  getParkingAreasWithSlots,
  getAvailableSlots,
  registerUserAndAssignSlot,
  exitUserAndFreeSlot,
  getCurrentVehicles,
  initializeParkingAreaSlots,
  recalculateSlotCounts
} from '../controllers/slotManagement.controller.js';

const r = express.Router();

// Get all parking areas with slot information
r.get('/parking-areas', getParkingAreasWithSlots);

// Get available slots for a specific parking area
r.get('/parking-areas/:parkingAreaId/available-slots', getAvailableSlots);

// Register user and assign slot
r.post('/register-user', registerUserAndAssignSlot);

// Exit user and free slot
r.put('/exit-user/:vehicleId', exitUserAndFreeSlot);

// Get current vehicles in parking
r.get('/current-vehicles', getCurrentVehicles);

// Initialize parking area slots
r.post('/initialize-slots/:parkingAreaId', initializeParkingAreaSlots);

// Recalculate slot counts for a parking area
r.post('/recalculate-slots/:parkingAreaId', recalculateSlotCounts);

export default r;
