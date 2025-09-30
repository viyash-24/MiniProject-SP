import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  userName: { type: String },
  userPhone: { type: String },
  vehiclePlate: { type: String, required: true },
  vehicleType: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['Manual', 'UPI', 'Card', 'Wallet', 'Cash', 'Stripe'], default: 'Cash' },
  status: { type: String, enum: ['Success', 'Offline', 'Failed'], default: 'Success' },
  time: { type: Date, default: Date.now },
  receiptId: { type: String, index: true },
  paymentDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
