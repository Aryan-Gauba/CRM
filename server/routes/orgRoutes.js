// server/routes/orgRoutes.js
const express = require('express');
const router = express.Router();
const { getOrgDetails, updateOrgEmailSettings } = require('../controllers/orgController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getOrgDetails);
// Only Admins can modify organizational email/SMTP configurations
router.put('/smtp', authenticateToken, authorizeRoles('Admin'), updateOrgEmailSettings);

module.exports = router;