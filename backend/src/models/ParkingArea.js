import mongoose from 'mongoose';

const parkingAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  photo: { type: String }, // URL to the photo
  totalSlots: { type: Number, required: true, min: 1 },
  availableSlots: { type: Number, default: 0, min: 0 },
  occupiedSlots: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdBy: { type: String, required: true }, // Admin email who created it
  slots: [{
    slotNumber: { type: Number, required: true },
    isOccupied: { type: Boolean, default: false },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    occupiedAt: { type: Date }
  }]
}, { timestamps: true });

export const ParkingArea = mongoose.model('ParkingArea', parkingAreaSchema);
