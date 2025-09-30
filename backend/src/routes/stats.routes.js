import express from 'express';
import { getDashboardStats } from '../controllers/stats.controller.js';

const r = express.Router();

// Get dashboard statistics
r.get('/dashboard', getDashboardStats);

export default r;
