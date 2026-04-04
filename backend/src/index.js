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

const parseOriginList = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/*
  CORS notes:
  - Browsers enforce CORS based on the request Origin.
  - When testing from another device on your LAN, the frontend Origin becomes
    something like http://192.168.x.x:3000, which must be allowed.
  - We keep credentials enabled, so we must NOT use `*`.
*/
const configuredOrigins = new Set([
  ...parseOriginList(env.CORS_ORIGIN),
  'https://d2o2ph936bp75l.cloudfront.net',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

const originRegexAllowlist = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/(\d{1,3}\.){3}\d{1,3}:\d+$/,
  /^https:\/\/localhost:\d+$/
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (configuredOrigins.has(origin)) return true;
  if (env.NODE_ENV !== 'production') {
    return originRegexAllowlist.some((re) => re.test(origin));
  }
  return false;
};

/* socket.io cors */
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
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
    return callback(null, isOriginAllowed(origin));
  },
  credentials: true
}));

/* Middleware */
app.use(
  helmet({
    // The default `same-origin` can cause browsers to block cross-origin API
    // responses even when CORS is configured, surfacing as `TypeError: Failed to fetch`.
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
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