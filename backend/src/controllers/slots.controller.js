import { Slot } from '../models/Slot.js';
import { io } from '../index.js';

export async function listSlots(_req, res) {
  const slots = await Slot.find().sort({ name: 1 });
  res.json({ slots });
}

export async function createSlot(req, res) {
  const { name, area, total = 0, free = 0 } = req.body;
  const exists = await Slot.findOne({ name });
  if (exists) return res.status(400).json({ error: 'Slot exists' });
  
  const slot = await Slot.create({ name, area, total, free });
  
  // Emit socket event for new slot
  io.emit('slot:updated', { 
    type: 'created',
    slot: slot.toObject()
  });
  
  res.json({ slot });
}

export async function updateSlot(req, res) {
  const { id } = req.params;
  const { total, free, area, active } = req.body;
  
  const slot = await Slot.findByIdAndUpdate(
    id, 
    { $set: { total, free, area, active } }, 
    { new: true }
  );
  
  if (!slot) {
    return res.status(404).json({ error: 'Slot not found' });
  }
  
  // Emit socket event for updated slot
  io.emit('slot:updated', {
    type: 'updated',
    slot: slot.toObject()
  });
  
  res.json({ slot });
}
