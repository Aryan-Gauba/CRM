// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getUsers } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware'); // Destructure authenticateToken correctly

router.post('/register', register);
router.post('/login', login);
router.get('/users', authenticateToken, getUsers); // Use authenticateToken here

module.exports = router;