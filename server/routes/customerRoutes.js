// server/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createCustomer);
router.get('/', authenticateToken, getCustomers);
router.put('/:id', authenticateToken, updateCustomer);
router.delete('/:id', authenticateToken, deleteCustomer);

module.exports = router;