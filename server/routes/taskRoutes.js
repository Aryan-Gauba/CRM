// server/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus } = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createTask);
router.get('/', authenticateToken, getTasks);
router.put('/:id/status', authenticateToken, updateTaskStatus);

module.exports = router;