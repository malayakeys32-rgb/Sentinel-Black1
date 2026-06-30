const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    totalCases: 14,
    pendingReview: 3,
    archived: 11,
    items: [
      { id: 1, name: 'Surveillance Photo Set A', case: 'CASE-1042', status: 'Reviewed' },
      { id: 2, name: 'Audio Intercept 0098', case: 'CASE-1051', status: 'Pending' },
      { id: 3, name: 'Field Report - Night Watch', case: 'CASE-1042', status: 'Archived' }
    ]
  });
});

module.exports = router;
