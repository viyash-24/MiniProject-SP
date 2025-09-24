import { Router } from 'express';
import { listPublicParkingAreas } from '../controllers/parkingAreas.controller.js';

const r = Router();

r.get('/', listPublicParkingAreas);

export default r;
