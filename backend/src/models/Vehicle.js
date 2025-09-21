import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  plate: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  userName: { type: String },
  userPhone: { type: String },
  vehicleType: { 
    type: String, 
    enum: ['Car', 'Bike',  'Scooter','van' ,'Other'],
    default: 'Car',
    required: true 
  },
  parkingAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingArea' },
  slotNumber: { type: Number, default: null },
  status: { type: String, enum: ['Parked', 'Paid', 'Exited'], default: 'Parked' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  entryTime: { type: Date, default: Date.now },
  exitTime: { type: Date },
  createdBy: { type: String },
}, { timestamps: true });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
