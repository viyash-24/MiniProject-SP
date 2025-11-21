import { Router } from 'express';
import { listPublicParkingAreas, getPublicParkingArea } from '../controllers/parkingAreas.controller.js';

const r = Router();

r.get('/', listPublicParkingAreas);
r.get('/:id', getPublicParkingArea);

export default r;
