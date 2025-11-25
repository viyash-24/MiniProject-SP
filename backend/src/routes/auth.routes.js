import { Router } from 'express';
import { login, me, register, logout, updateProfile, enrollEmail } from '../controllers/auth.controller.js';
import { authRequired } from '../middleware/auth.js';

const r = Router();

r.post('/register', register);
r.post('/login', login);
r.get('/me', authRequired, me);
r.put('/me', authRequired, updateProfile);
r.post('/logout', authRequired, logout);
r.post('/enroll-email', enrollEmail);

export default r;
