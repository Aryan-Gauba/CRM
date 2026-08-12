// server/routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const { sendEmailToLead } = require('../controllers/emailController');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST route to send email, protected by JWT authentication
router.post('/send', authenticateToken, sendEmailToLead);

module.exports = router;