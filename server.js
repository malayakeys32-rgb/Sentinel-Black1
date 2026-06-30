const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    systemsOnline: 7,
    activeAlerts: 2,
    operativesDeployed: 5,
    recentActivity: [
      { id: 1, text: 'Agent Alpha logged in', time: '04:00' },
      { id: 2, text: 'Recon mission completed', time: '03:45' },
      { id: 3, text: 'Alert: Intrusion detected', time: '03:30' }
    ],
    currentOp: 'Night Watch',
    threatLevel: 'HIGH'
  });
});

module.exports = router;
