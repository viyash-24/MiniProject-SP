import { User } from '../models/User.js';
import { hashPassword } from '../utils/passwords.js';
import { Vehicle } from '../models/Vehicle.js';
import { sendEnrollmentEmail } from '../utils/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { isValidEmail, isValidPhone, normalizeEmail, normalizePhone } from '../utils/validation.js';

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ users });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password = 'changeme123', role = 'user' } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!name || !normalizedEmail) {
    throw new AppError(400, 'name and email are required', 'MISSING_FIELDS', { required: ['name', 'email'] });
  }
  if (!isValidEmail(normalizedEmail)) {
    throw new AppError(400, 'Invalid email address', 'INVALID_EMAIL');
  }
  if (!isValidPhone(phone)) {
    throw new AppError(400, 'Invalid phone number', 'INVALID_PHONE');
  }
  const normalizedPhone = phone ? normalizePhone(phone) : undefined;

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    // If user exists, check if they have any active vehicles (Parked or Paid)
    const Vehicle = (await import('../models/Vehicle.js')).Vehicle;
    const activeVehicles = await Vehicle.findOne({
      userEmail: normalizedEmail,
      status: { $in: ['Parked', 'Paid'] }
    });

    if (activeVehicles) {
      return res.status(400).json({
        error: 'User has an active vehicle in the parking area. Please exit the vehicle before registering again.'
      });
    }

    // User exists but no active vehicles - allow creation (re-registration)
    return res.json({
      user: {
        _id: existingUser._id,
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        role: existingUser.role
      },
      message: 'User re-registered successfully (existing user with no active vehicles)'
    });
  }

  // Create new user
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email: normalizedEmail, phone: normalizedPhone, passwordHash, role });
  
  // Send enrollment email 
  sendEnrollmentEmail({ 
    to: user.email, 
    name: user.name 
  }).catch(err => {
    console.error('Failed to send enrollment email:', err);
    // Don't fail the request if email sending fails
  });
  
  res.json({ user: { _id: user._id, id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
});
