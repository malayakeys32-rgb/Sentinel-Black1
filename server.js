const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "sentinelblacksecret";

function verify(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing token" });

  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/ops', require('./routes/ops'));
app.use('/api/system', require('./routes/system'));
app.use('/api/settings', require('./routes/settings'));

// Serve UI
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sentinel-Black Tactical Ops running on port ${PORT}`);
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/ops', require('./routes/ops'));
app.use('/api/system', require('./routes/system'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/auth', require('./routes/auth'));


