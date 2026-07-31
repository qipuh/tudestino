import './dotenv-config.js';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { connectDB } from './config/database-mysql.js';
import { setupAssociations } from './config/associations.js';
import { initFirebaseAdmin } from './config/firebase-admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './config/socket.js';
import passport from './config/passport.js';

// Routes

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import propertyRoutes from './modules/properties/properties.routes.js';
import bookingRoutes from './modules/bookings/bookings.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import reviewRoutes from './modules/reviews/reviews.routes.js';
import messageRoutes from './modules/messaging/messaging.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import socialRoutes from './modules/social/social.routes.js';
import postsRoutes from './modules/social/posts.routes.js';
import routesRoutes from './modules/routes/routes.routes.js';
import routingRoutes from './modules/routing/routing.routes.js';
import migrationsRoutes from './modules/migrations/migrations.routes.js';
import restaurantRoutes from './modules/restaurants/restaurants.routes.js';
import entertainmentRoutes from './modules/entertainment/entertainment.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import businessesRoutes from './modules/businesses/index.js';
import reservationsRoutes from './modules/reservations/reservations.routes.js';
import servicesRoutes from './modules/services/services.routes.js';
import offersRoutes from './modules/offers/offers.routes.js';
import toursRoutes from './modules/tours/tour.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import countriesRoutes from './modules/countries/countries.routes.js';
import locationsRoutes from './modules/locations/locations.routes.js';
import slidersRoutes from './modules/sliders/slider.routes.js';
import attractionsRoutes from './modules/attractions/attraction.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import verificationRoutes from './modules/verification/verification.routes.js';
import favoritesRoutes from './modules/favorites/favorites.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import promotionsRoutes from './modules/promotions/promotions.routes.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.IO
const io = initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Passport
app.use(passport.initialize());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Hacer io disponible en req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database connection and model associations
setupAssociations();
connectDB();
initFirebaseAdmin();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/social', postsRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/routing', routingRoutes);
app.use('/api/migrations', migrationsRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/entertainment', entertainmentRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/sliders', slidersRoutes);
app.use('/api/attractions', attractionsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/promotions', promotionsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.IO initialized`);
});

export default app;
