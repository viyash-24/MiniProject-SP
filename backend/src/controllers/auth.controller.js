import { User } from '../models/User.js';
import { comparePassword, hashPassword } from '../utils/passwords.js';
import { signToken } from '../utils/jwt.js';
import { sendEnrollmentEmail } from '../utils/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body || {};
  const normalizedEmail = String(email || '').toLowerCase().trim();
  if (!name || !normalizedEmail || !password) {
    throw new AppError(400, 'Missing required fields', 'MISSING_FIELDS', { required: ['name', 'email', 'password'] });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new AppError(400, 'Email already in use', 'EMAIL_IN_USE');

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email: normalizedEmail, phone, passwordHash, role: 'user' });
  const token = signToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
});

//login function
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').toLowerCase().trim();
  if (!normalizedEmail || !password) {
    throw new AppError(400, 'Missing required fields', 'MISSING_FIELDS', { required: ['email', 'password'] });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new AppError(400, 'Invalid credentials', 'INVALID_CREDENTIALS');

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw new AppError(400, 'Invalid credentials', 'INVALID_CREDENTIALS');

  const token = signToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
});

export const me = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, photoUrl, password } = req.body || {};
  const userId = req.user?.id;
  if (!userId) throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

  if (email && String(email).toLowerCase() !== user.email) {
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) throw new AppError(400, 'Email already in use', 'EMAIL_IN_USE');
    user.email = normalizedEmail;
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (photoUrl !== undefined) user.photoUrl = photoUrl;
  if (password) user.passwordHash = await hashPassword(password);

  await user.save();

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    photoUrl: user.photoUrl
  };

  res.json({ user: safeUser });
});


export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

export const enrollEmail = asyncHandler(async (req, res) => {
  const { to, name, loginUrl } = req.body || {};
  const email = String(to || '').toLowerCase().trim();
  if (!email) throw new AppError(400, 'Recipient email required', 'MISSING_FIELDS', { required: ['to'] });

  const ok = await sendEnrollmentEmail({ to: email, name: name || 'User', loginUrl });
  if (!ok) throw new AppError(502, 'Failed to send enrollment email', 'EMAIL_SEND_FAILED');

  res.json({ ok: true });
});
