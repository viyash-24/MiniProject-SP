import mongoose from 'mongoose';

const parkingChargeSchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    required: true,
    unique: true,
    enum: ['Car', 'Bike', 'Van', 'Auto', 'Other'],
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
    default: 'LKR',
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


parkingChargeSchema.methods.formatCharge = function() {
  return `Rs ${this.amount} ${this.duration}`;
};

export const ParkingCharge = mongoose.model('ParkingCharge', parkingChargeSchema);
