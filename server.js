// Core modules
const express = require('express');
const path = require('path');

// Security modules
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
;

// Initialize app
const app = express();

// -------------------------------------------------------------
// 🔐 GLOBAL SECURITY MIDDLEWARE
// -------------------------------------------------------------

// Helmet: industry‑standard security headers
app.use(helmet());

// Custom security headers (Render scanners require these)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS hardening
app.use(cors({
  origin: '*',          // You can restrict this later
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (prevents brute‑force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 200,                   // limit each IP
  message: { error: 'Too many requests, slow down.' }
});
app.use(limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------------
// 📡 ROUTES — ONLY THE ONES YOU ACTUALLY HAVE
// -------------------------------------------------------------

const dashboardRoutes = require('./routes/dashboard');
const evidenceRoutes = require('./routes/evidence');
const opsRoutes = require('./routes/ops');
const systemRoutes = require('./routes/system');
const settingsRoutes = require('./routes/settings');

// Attach routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/ops', opsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/settings', settingsRoutes);

// -------------------------------------------------------------
// 🩺 HEALTH CHECK ENDPOINT (Render uses this)
// -------------------------------------------------------------
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Sentinel-Black TacticalOps' });
});

// -------------------------------------------------------------
// 🚀 SERVER START
// -------------------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Sentinel-Black TacticalOps API running on port ${PORT}`);
});
