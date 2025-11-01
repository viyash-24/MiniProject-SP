import { User } from '../models/User.js';
import { comparePassword, hashPassword } from '../utils/passwords.js';
import { signToken } from '../utils/jwt.js';

export async function register(req, res) {
  const { name, email, phone, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(400).json({ error: 'Email already in use' });
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email: email.toLowerCase(), phone, passwordHash, role: 'user' });
  const token = signToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email||'').toLowerCase() });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json({ user });
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ ok: true });
}
