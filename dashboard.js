const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    cpuLoad: '42%',
    memoryUsage: '61%',
    networkStatus: 'Stable',
    uptime: '14d 6h 32m',
    services: [
      { name: 'Comms Relay', status: 'Online' },
      { name: 'Database Cluster', status: 'Online' },
      { name: 'Encryption Module', status: 'Online' }
    ]
  });
});

module.exports = router;
