import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const adminAllowlist = String(env.ADMIN_EMAIL_ALLOWLIST || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function authRequired(req, res, next) {
  try {
    // Admin email bypass (for Firebase-fronted admin panel)
    const adminEmailHeader = req.headers['x-admin-email'];
    if (adminEmailHeader) {
      const email = String(adminEmailHeader).toLowerCase();
      if (adminAllowlist.includes(email)) {
        req.user = { id: email, role: 'admin', email };
        return next();
      }
    }

    // User email bypass for authenticated end-users (from frontend)
    // Allows typical user flows (e.g., Stripe payments, vehicle search) without JWT
    const userEmailHeader = req.headers['x-user-email'];
    if (userEmailHeader) {
      const email = String(userEmailHeader).toLowerCase();
      req.user = { id: email, role: 'user', email };
      return next();
    }

    const bearer = req.headers.authorization || '';
    const token = (bearer.startsWith('Bearer ') ? bearer.slice(7) : null) || req.cookies?.token;
    if (!token) return next(new AppError(401, 'Unauthorized', 'UNAUTHORIZED'));
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    next();
  } catch (e) {
    return next(new AppError(401, 'Unauthorized', 'UNAUTHORIZED'));
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return next(new AppError(403, 'Forbidden', 'FORBIDDEN'));
}
