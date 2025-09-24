import { Router } from 'express';
import { listUsers, createUser } from '../controllers/users.controller.js';
import { authRequired, requireAdmin } from '../middleware/auth.js';

const r = Router();

r.use(authRequired, requireAdmin);

r.get('/', listUsers);
r.post('/', createUser);

export default r;
