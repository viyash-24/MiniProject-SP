import { User } from '../models/User.js';
import { hashPassword } from '../utils/passwords.js';
import { Vehicle } from '../models/Vehicle.js';
import { sendEnrollmentEmail } from '../utils/email.js';

export async function listUsers(_req, res) {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ users });
}

export async function createUser(req, res) {
  const { name, email, phone, password = 'changeme123', role = 'user' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    // If user exists, check if they have any active vehicles (Parked or Paid)
    const Vehicle = (await import('../models/Vehicle.js')).Vehicle;
    const activeVehicles = await Vehicle.findOne({
      userEmail: email.toLowerCase(),
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
  const user = await User.create({ name, email: email.toLowerCase(), phone, passwordHash, role });
  
  // Send enrollment email (don't await to avoid blocking the response)
  sendEnrollmentEmail({ 
    to: user.email, 
    name: user.name 
  }).catch(err => {
    console.error('Failed to send enrollment email:', err);
    // Don't fail the request if email sending fails
  });
  
  res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
}
