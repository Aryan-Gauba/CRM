// server/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getNotifications);

module.exports = router;