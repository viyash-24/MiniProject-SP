import { Router } from 'express';
import { login, me, register, logout } from '../controllers/auth.controller.js';
import { authRequired } from '../middleware/auth.js';

const r = Router();

r.post('/register', register);
r.post('/login', login);
r.get('/me', authRequired, me);
r.post('/logout', authRequired, logout);

export default r;
