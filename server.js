const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

