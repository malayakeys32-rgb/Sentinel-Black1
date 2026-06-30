const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    systemsOnline: 7,
    activeAlerts: 2,
    operativesDeployed: 5,
    currentOp: "Night Watch",
    threatLevel: "HIGH",
    recentActivity: [
      { text: "Agent Alpha logged in", time: "04:00" },
      { text: "Recon mission completed", time: "03:45" },
      { text: "Alert: Intrusion detected", time: "03:30" }
    ]
  });
});

module.exports = router;
