import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import http from 'http';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15000,
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API Routes (placeholder)
app.get('/api/v1/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Kavach backend API is running',
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Emergency incident event
  socket.on('incident:fire', (incidentData) => {
    console.log(`[Incident] Crash detected: ${incidentData.incidentId}`);
    io.emit('incident:alert', {
      incidentId: incidentData.incidentId,
      type: 'crash',
      timestamp: new Date().toISOString(),
      data: incidentData,
    });
  });

  // Location update
  socket.on('location:update', (locationData) => {
    socket.broadcast.emit('location:update', locationData);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    data: null,
    error: NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    data: null,
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  🛡️  Kavach Backend - ${NODE_ENV.toUpperCase()}            ║
║  Server running on port ${PORT}              ║
║  Socket.io enabled for real-time comms   ║
╚══════════════════════════════════════════╝
  `);
});

export { app, io };
