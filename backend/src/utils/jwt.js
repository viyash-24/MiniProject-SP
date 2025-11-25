import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(user) {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    role: user.role,
    email: (user.email || '').toLowerCase(),
  };

  return jwt.sign(payload, env.JWT_SECRET);
}
