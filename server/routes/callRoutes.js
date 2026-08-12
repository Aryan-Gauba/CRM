// server/routes/callRoutes.js
const express = require('express');
const router = express.Router();
const { logCall, getCallLogsForLead } = require('../controllers/callController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Log a new call
router.post('/', authenticateToken, logCall);

// Get all call history for a specific lead
router.get('/lead/:leadId', authenticateToken, getCallLogsForLead);

module.exports = router;