const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
const User = require('./models/User');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------
// Connect to MongoDB & start server
// ----------------------------
const startServer = async () => {
  try {
    // Connect to DB (with retry logic inside connectDB)
    await connectDB();

    // Seed superadmin if needed (after connection)
    await seedSuperAdminIfNeeded();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// ----------------------------
// Auto‑seed superadmin
// ----------------------------
const seedSuperAdminIfNeeded = async () => {
  try {
    const superAdminExists = await User.findOne({ role: 'superadmin' });
    if (!superAdminExists) {
      console.log('🔄 No superadmin found. Seeding default superadmin...');
      const generatedPassword = 'SuperAdmin@2026!';
      await User.create({
        username: 'superadmin',
        email: 'superadmin@cafemenu.com',
        password: generatedPassword,
        role: 'superadmin',
        isBlocked: false,
      });
      console.log('✅ Superadmin created successfully:');
      console.log(`   Username: superadmin`);
      console.log(`   Password: ${generatedPassword}`);
      console.log('   ⚠️ Please change these credentials after first login.');
    } else {
      console.log('✅ Superadmin already exists. Skipping seed.');
    }
  } catch (error) {
    console.error('❌ Error seeding superadmin:', error.message);
  }
};

// =============================================
// Middleware
// =============================================
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const cacheControl = (req, res, next) => {
  if (req.method === 'GET' && req.path.startsWith('/api/menu/') && !req.path.includes('?all')) {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  next();
};
app.use(cacheControl);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));


app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    res.status(200).json({
      status: dbState === 1 ? 'OK' : 'Degraded',
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
// Error Handler (must be last)
// =============================================
app.use(errorHandler);

// =============================================
// Start the server
// =============================================
startServer();