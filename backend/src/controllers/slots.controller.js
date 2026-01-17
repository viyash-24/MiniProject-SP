import { Slot } from '../models/Slot.js';
import { io } from '../index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const listSlots = asyncHandler(async (_req, res) => {
  const slots = await Slot.find().sort({ name: 1 });
  res.json({ slots });
});

export const createSlot = asyncHandler(async (req, res) => {
  const { name, area, total = 0, free = 0 } = req.body;
  const exists = await Slot.findOne({ name });
  if (exists) throw new AppError(400, 'Slot exists', 'SLOT_EXISTS');
  
  const slot = await Slot.create({ name, area, total, free });
  
  // Emit socket event for new slot
  io.emit('slot:updated', { 
    type: 'created',
    slot: slot.toObject()
  });
  
  res.json({ slot });
});

export const updateSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { total, free, area, active } = req.body;
  
  const slot = await Slot.findByIdAndUpdate(
    id, 
    { $set: { total, free, area, active } }, 
    { new: true }
  );
  
  if (!slot) {
    throw new AppError(404, 'Slot not found', 'SLOT_NOT_FOUND');
  }
  
  // Emit socket event for updated slot
  io.emit('slot:updated', {
    type: 'updated',
    slot: slot.toObject()
  });
  
  res.json({ slot });
});
