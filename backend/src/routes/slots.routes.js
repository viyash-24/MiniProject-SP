import { Router } from 'express';
import { listSlots, createSlot, updateSlot } from '../controllers/slots.controller.js';
import { authRequired, requireAdmin } from '../middleware/auth.js';

const r = Router();

r.use(authRequired, requireAdmin);

r.get('/', listSlots);
r.post('/', createSlot);
r.put('/:id', updateSlot);

export default r;
