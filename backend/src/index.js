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

/* Define frontend origins */
const allowedOrigins = [
  'http://smpark-frontend.s3-website-us-east-1.amazonaws.com',
  'http://localhost:3000' // optional for local dev
];

/* socket.io cors */
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* Socket connections */
const clients = new Set();

io.on('connection', (socket) => {
  console.log('New client connected');
  clients.add(socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clients.delete(socket);
  });
});

/* Make io available */
app.set('io', io);

/*  Express cors */
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow tools like Postman

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

/* Middleware */
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

/* Root route */
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

/* Health check */
app.get('/api/health', (_req, res) => res.json({ ok: true }));

/* Routes */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/parking-areas', parkingAreaRoutes);
app.use('/api/public/parking-areas', publicParkingAreaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/slot-management', slotManagementRoutes);
app.use('/api/parking-charges', parkingChargeRoutes);

/* Static files */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* Error handlers */
app.use(notFound);
app.use(errorHandler);

/* Start server */
(async () => {
  await connectDB();
  await seedAdmin();

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on PORT:${env.PORT}`);
  });
})();

export { io };