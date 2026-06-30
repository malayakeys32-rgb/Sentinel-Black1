const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: "Settings endpoint operational",
    mode: "Tactical"
  });
});

module.exports = router;
