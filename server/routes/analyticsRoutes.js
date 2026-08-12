const express = require('express');
const router = express.Router();
const { getSalesAnalytics } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getSalesAnalytics);

module.exports = router;