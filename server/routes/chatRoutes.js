// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { getChatHistory } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get chat history, protected by JWT authentication
router.get('/', authenticateToken, getChatHistory);

module.exports = router;