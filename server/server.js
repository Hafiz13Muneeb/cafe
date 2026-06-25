// server.js - Main Express application with auto-seed
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
const Admin = require('./models/Admin');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// ------------------------------------------------------------
// AUTO-SEED ADMIN (if none exists)
// ------------------------------------------------------------
const seedAdminIfNeeded = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('🔄 No admin found. Seeding default admin...');
      await Admin.create({
        username: 'admin',
        password: 'admin123', // will be hashed by pre-save hook
        whatsappNumber: '923001234567',
        cafeName: 'My Cafe',
      });
      console.log('✅ Default admin created:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠️ Please change these after first login.');
    } else {
      console.log('✅ Admin already exists. Skipping seed.');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
};

// Call the seed function (waits for connection to be ready)
seedAdminIfNeeded();
// ------------------------------------------------------------

const app = express();

// =============================================
// Logging
// =============================================
app.use(morgan('dev')); // 'dev' gives concise colored output

// =============================================
// Rate Limiting (prevent brute-force)
// =============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply rate limiting to all API routes
app.use('/api', limiter);

// =============================================
// Caching Middleware for Public GET endpoints
// =============================================
// Cache GET /api/menu responses for 5 minutes (300 seconds) - helps with performance
const cacheControl = (req, res, next) => {
  // Only apply to GET /api/menu without authentication (public)
  if (req.method === 'GET' && req.path === '/api/menu' && !req.query.all) {
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
  }
  next();
};
app.use(cacheControl);

// =============================================
// Core Middleware
// =============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// =============================================
// Routes
// =============================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Health check endpoint (also responds with DB status if needed)
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const status = dbState === 1 ? 'OK' : 'Degraded';
    res.status(200).json({
      status: status,
      message: 'Server is running',
      db: dbState === 1 ? 'connected' : 'disconnected',
    });
  } catch (err) {
    res.status(500).json({ status: 'Error', message: err.message });
  }
});

// =============================================
// Serve Frontend in Production
// =============================================
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// =============================================
// Error handling middleware (must be last)
// =============================================
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});