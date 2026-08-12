// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { scoreLead } = require('../controllers/aiController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Allow Admins, Sales Managers, and Sales Executives to score leads
router.get('/score/:id', authenticateToken, authorizeRoles('Admin', 'Sales Manager', 'Sales Executive'), scoreLead);

module.exports = router;