import mongoose from 'mongoose';

const parkingAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  photo: { type: String }, // URL to the photo
  // Per-vehicle-type slot counts (optional; if provided, totalSlots will be derived)
  carSlots: { type: Number, default: 0, min: 0 },
  bikeSlots: { type: Number, default: 0, min: 0 },
  vanSlots: { type: Number, default: 0, min: 0 },
  threeWheelerSlots: { type: Number, default: 0, min: 0 },
  totalSlots: { type: Number, required: true, min: 1 },
  availableSlots: { type: Number, default: 0, min: 0 },
  occupiedSlots: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdBy: { type: String, required: true }, // Admin email who created it
  slots: [{
    slotNumber: { type: Number, required: true },
    isOccupied: { type: Boolean, default: false },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    occupiedAt: { type: Date },
    vehicleType: { type: String, enum: ['Car', 'Bike', 'Van', 'Three-wheeler'], default: 'Car' }
  }]
}, { timestamps: true });

// Derive totalSlots from per-type counts when applicable
parkingAreaSchema.pre('save', function(next) {
  try {
    const car = Number(this.carSlots || 0);
    const bike = Number(this.bikeSlots || 0);
    const van = Number(this.vanSlots || 0);
    const three = Number(this.threeWheelerSlots || 0);
    const sum = car + bike + van + three;
    if (sum > 0) {
      // Adjust availableSlots proportionally only if not initialized (no slots array yet)
      const hadSlots = Array.isArray(this.slots) && this.slots.length > 0;
      const prevTotal = Number(this.totalSlots || 0);
      this.totalSlots = sum;
      if (!hadSlots) {
        // If availableSlots not set, initialize to total
        if (this.isNew || this.availableSlots == null) {
          this.availableSlots = sum;
        } else if (prevTotal && this.availableSlots != null) {
          const diff = sum - prevTotal;
          this.availableSlots = Math.max(0, Number(this.availableSlots) + diff);
        }
      }
    }
  } catch (_) {}
  next();
});

export const ParkingArea = mongoose.model('ParkingArea', parkingAreaSchema);
