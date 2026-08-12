// server/controllers/customerController.js
const pool = require('../config/db');

const createCustomer = async (req, res) => {
  const { name, company, email, phone, address, notes } = req.body;
  const orgId = req.user.org_id;

  try {
    const newCustomer = await pool.query(
      'INSERT INTO customers (name, company, email, phone, address, notes, org_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, company, email, phone, address, notes, orgId]
    );
    res.status(201).json(newCustomer.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while creating customer' });
  }
};

const getCustomers = async (req, res) => {
  const orgId = req.user.org_id;
  try {
    const customers = await pool.query('SELECT * FROM customers WHERE org_id = $1 ORDER BY created_at DESC', [orgId]);
    res.json(customers.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while fetching customers' });
  }
};

const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, company, email, phone, address, notes } = req.body;
  const orgId = req.user.org_id;

  try {
    const updatedCustomer = await pool.query(
      'UPDATE customers SET name = $1, company = $2, email = $3, phone = $4, address = $5, notes = $6 WHERE id = $7 AND org_id = $8 RETURNING *',
      [name, company, email, phone, address, notes, id, orgId]
    );
    if (updatedCustomer.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(updatedCustomer.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating customer' });
  }
};

const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.org_id;
  try {
    const deletedCustomer = await pool.query('DELETE FROM customers WHERE id = $1 AND org_id = $2 RETURNING *', [id, orgId]);
    if (deletedCustomer.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting customer' });
  }
};

module.exports = { createCustomer, getCustomers, updateCustomer, deleteCustomer };