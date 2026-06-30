const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: "Ops endpoint operational",
    operations: []
  });
});

module.exports = router;
