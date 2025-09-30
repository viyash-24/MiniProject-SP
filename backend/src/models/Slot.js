import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  area: { type: String },
  parkingAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingArea' }, // Reference to parking area
  total: { type: Number, required: true, default: 0 },
  free: { type: Number, required: true, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export const Slot = mongoose.model('Slot', slotSchema);
