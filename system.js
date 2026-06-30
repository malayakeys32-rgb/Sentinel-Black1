const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    notifications: true,
    twoFactorAuth: true,
    theme: 'dark-tactical',
    apiAccessLevel: 'Admin'
  });
});

module.exports = router;
