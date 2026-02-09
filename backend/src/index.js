import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import vehicleRoutes from './routes/vehicles.routes.js';
import slotRoutes from './routes/slots.routes.js';
import paymentRoutes from './routes/payments.routes.js';
import parkingAreaRoutes from './routes/parkingAreas.routes.js';
import publicParkingAreaRoutes from './routes/publicParkingAreas.routes.js';
import statsRoutes from './routes/stats.routes.js';
import slotManagementRoutes from './routes/slotManagement.routes.js';
import parkingChargeRoutes from './routes/parkingCharges.routes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { seedAdmin } from './utils/seed.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN || 'https://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected clients
const clients = new Set();

io.on('connection', (socket) => {
  console.log('New client connected');
  clients.add(socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clients.delete(socket);
  });
});

// Make io available in routes
app.set('io', io);

// Security & common middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/parking-areas', parkingAreaRoutes);
app.use('/api/public/parking-areas', publicParkingAreaRoutes); // Public route for users
app.use('/api/stats', statsRoutes);
app.use('/api/slot-management', slotManagementRoutes);
app.use('/api/parking-charges', parkingChargeRoutes);

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start
(async () => {
  await connectDB();
  await seedAdmin();
  
  httpServer.listen(env.PORT, () => {
    console.log(`Server running on PORT:${env.PORT}`);
  });
})();

export { io };  
