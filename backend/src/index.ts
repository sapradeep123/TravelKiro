import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import locationRoutes from './routes/locations';
import eventRoutes from './routes/events';
import packageRoutes from './routes/packages';
import accommodationRoutes from './routes/accommodations';
import communityRoutes from './routes/community';
import groupTravelRoutes from './routes/groupTravel';
import approvalRoutes from './routes/approvals';
import notificationRoutes from './routes/notifications';
import seedRoutes from './routes/seed';
import eventTypeRoutes from './routes/eventTypes';
import albumRoutes, { photoRouter, commentRouter } from './routes/albums';
import messagingRoutes from './routes/messaging';
import siteSettingsRoutes from './routes/siteSettings';
import uploadRoutes from './routes/upload';
import chatbotRoutes from './routes/chatbot';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory with caching
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '7d', // Cache for 7 days
  etag: true,
  lastModified: true,
  setHeaders: (res, filepath) => {
    // Set cache control headers
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    name: 'Travel Encyclopedia API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to Travel Encyclopedia API',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      locations: '/api/locations',
      events: '/api/events',
      packages: '/api/packages',
      accommodations: '/api/accommodations',
      community: '/api/community',
      'group-travel': '/api/group-travel',
      albums: '/api/albums',
      messaging: '/api/messaging',
      uploads: '/uploads',
    },
    documentation: 'Visit /health for server status'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Travel Encyclopedia API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/group-travel', groupTravelRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/album-photos', photoRouter);
app.use('/api/photo-comments', commentRouter);
app.use('/api/messaging', messagingRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
});

export default app;
