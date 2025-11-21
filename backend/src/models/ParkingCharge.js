import mongoose from 'mongoose';

const parkingChargeSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    required: true,
    unique: true,
    enum: ['Car', 'Bike', 'Van', 'Bus', 'Truck', 'Auto', 'SUV', 'Other'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  duration: {
    type: String,
    default: 'per hour',
    enum: ['per hour', 'per day', 'flat rate'],
  },
  createdBy: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
parkingChargeSchema.index({ isActive: 1 });

// Method to format charge for display
parkingChargeSchema.methods.formatCharge = function() {
  return `₹${this.amount} ${this.duration}`;
};

export const ParkingCharge = mongoose.model('ParkingCharge', parkingChargeSchema);
