import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authRequired(req, res, next) {
  try {
    // Admin email bypass (for Firebase-fronted admin panel)
    const adminEmailHeader = req.headers['x-admin-email'];
    if (adminEmailHeader && String(adminEmailHeader).toLowerCase() === String(env.ADMIN_EMAIL).toLowerCase()) {
      req.user = { id: 'admin', role: 'admin', email: env.ADMIN_EMAIL };
      return next();
    }

    const bearer = req.headers.authorization || '';
    const token = (bearer.startsWith('Bearer ') ? bearer.slice(7) : null) || req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Forbidden' });
}
