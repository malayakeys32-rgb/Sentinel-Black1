const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'sentinelblacksecret';

app.use(cors());
app.use(express.json());

// Auth guard middleware
function verify(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing token' });

  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// API routes (protected)
app.use('/api/dashboard', verify, require('./routes/dashboard'));
app.use('/api/evidence', verify, require('./routes/evidence'));
app.use('/api/ops', verify, require('./routes/ops'));
app.use('/api/system', verify, require('./routes/system'));
app.use('/api/settings', verify, require('./routes/settings'));

// Auth route (public)
app.use('/api/auth', require('./routes/auth'));

// Static UI
app.use(express.static(path.join(__dirname, 'public')));

// Root -> dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Sentinel-Black Tactical Ops running on port ${PORT}`);
});
