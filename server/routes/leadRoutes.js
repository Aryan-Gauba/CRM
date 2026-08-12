// server/routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const { createLead, getLeads, updateLeadStatus, updateLead, deleteLead } = require('../controllers/leadController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protect all lead routes with authenticateToken
router.post('/', authenticateToken, createLead);
router.get('/', authenticateToken, getLeads);
router.put('/:id/status', authenticateToken, updateLeadStatus);
router.put('/:id', authenticateToken, updateLead);
router.delete('/:id', authenticateToken, deleteLead);

module.exports = router;