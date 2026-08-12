const express = require('express');
const router = express.Router();
const { getReportData } = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Only Admins and Sales Managers can fetch report summaries
router.get('/summary', authenticateToken, authorizeRoles('Admin', 'Sales Manager'), getReportData);

module.exports = router;