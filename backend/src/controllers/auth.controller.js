import { User } from '../models/User.js';
import { comparePassword, hashPassword } from '../utils/passwords.js';
import { signToken } from '../utils/jwt.js';
import { sendEnrollmentEmail } from '../utils/email.js';


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

//login function
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

export async function updateProfile(req, res) {
  try {
    const { name, email, phone, photoUrl, password } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ error: 'Email already in use' });
      user.email = email.toLowerCase();
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
  } catch (err) {
    console.error('updateProfile error', err);
    res.status(500).json({ error: 'Unable to update profile' });
  }
}


export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ ok: true });
}

export async function enrollEmail(req, res) {
  try {
    const { to, name, loginUrl } = req.body || {};
    const email = (to || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'Recipient email required' });

    const ok = await sendEnrollmentEmail({ to: email, name: name || 'User', loginUrl });
    if (!ok) return res.status(500).json({ error: 'Failed to send enrollment email' });
    res.json({ ok: true });
  } catch (err) {
    console.error('enrollEmail error', err);
    res.status(500).json({ error: 'Unable to send enrollment email' });
  }
}
