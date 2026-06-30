const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: "System health endpoint operational",
    cpu: "Normal",
    memory: "Stable",
    uptime: "Operational"
  });
});

module.exports = router;
