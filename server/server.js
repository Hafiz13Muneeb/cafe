// server/server.js - Single-cafe version with auto-seed
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { errorHandler } = require('./utils/errorHandler');
const mongoose = require('mongoose');

// 🆕 Import auto-seed function
const seedIfNeeded = require('./utils/seed');

// Load .env
const envPath = path.resolve(__dirname, '../.env');
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------
// 1. Security & Performance Middleware
// ----------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      },
    },
  })
);
app.use(compression());
app.set('trust proxy', 1);

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Rate limiting (global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ----------------------------
// 2. Body parsers (JSON & URL‑encoded)
// ----------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Cache control for public menu
const cacheControl = (req, res, next) => {
  if (req.method === 'GET' && req.path.startsWith('/api/menu/') && !req.path.includes('?all')) {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  next();
};
app.use(cacheControl);

// ----------------------------
// 3. Routes (No payment, no user routes)
// ----------------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));

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

// ----------------------------
// 4. Favicon handler
// ----------------------------
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// ----------------------------
// 5. Serve Frontend (Production)
// ----------------------------
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ----------------------------
// 6. Error Handler
// ----------------------------
app.use(errorHandler);

// ----------------------------
// 7. Start Server
// ----------------------------
const startServer = async () => {
  try {
    await connectDB();
    // 🆕 Auto-seed if needed
    await seedIfNeeded();
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();