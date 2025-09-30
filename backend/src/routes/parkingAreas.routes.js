import { Router } from 'express';
import { 
  listParkingAreas, 
  createParkingArea, 
  updateParkingArea, 
  deleteParkingArea,
  getParkingArea
} from '../controllers/parkingAreas.controller.js';
import { authRequired, requireAdmin } from '../middleware/auth.js';

const r = Router();

r.use(authRequired, requireAdmin);

r.get('/', listParkingAreas);
r.get('/:id', getParkingArea);
r.post('/', createParkingArea);
r.put('/:id', updateParkingArea);
r.delete('/:id', deleteParkingArea);

export default r;
