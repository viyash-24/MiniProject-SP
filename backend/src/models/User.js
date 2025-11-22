import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true, index: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  photoUrl: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user', index: true },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
