// server/controllers/leadController.js
const pool = require('../config/db');

const createLead = async (req, res) => {
  const { name, company, email, phone, source, deal_value } = req.body;
  const assigned_to = req.user.id;
  const orgId = req.user.org_id; // Tenant scope

  try {
    const newLead = await pool.query(
      'INSERT INTO leads (name, company, email, phone, source, deal_value, assigned_to, org_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, company, email, phone, source, deal_value || 0, assigned_to, orgId]
    );
    res.status(201).json(newLead.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while creating lead' });
  }
};

const getLeads = async (req, res) => {
  const orgId = req.user.org_id;
  try {
    const leads = await pool.query(`
      SELECT leads.*, users.name AS assigned_user_name 
      FROM leads 
      LEFT JOIN users ON leads.assigned_to = users.id
      WHERE leads.org_id = $1
      ORDER BY leads.created_at DESC
    `, [orgId]);
    res.json(leads.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while fetching leads' });
  }
};

const updateLeadStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orgId = req.user.org_id;

  try {
    const updatedLead = await pool.query(
      'UPDATE leads SET status = $1 WHERE id = $2 AND org_id = $3 RETURNING *',
      [status, id, orgId]
    );

    if (updatedLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = updatedLead.rows[0];

    if (lead.assigned_to) {
      const io = req.app.get('io');
      io.to(`user_${lead.assigned_to}`).emit('receive_notification', {
        id: Date.now(),
        type: 'status_change',
        message: `Lead "${lead.name}" status updated to ${status}`
      });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateLead = async (req, res) => {
  const { id } = req.params;
  const { name, company, email, phone, source, status, deal_value } = req.body;
  const orgId = req.user.org_id;

  try {
    const updatedLead = await pool.query(
      `UPDATE leads 
       SET name = $1, company = $2, email = $3, phone = $4, source = $5, status = $6, deal_value = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 AND org_id = $9 RETURNING *`,
      [name, company, email, phone, source, status, deal_value || 0, id, orgId]
    );

    if (updatedLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(updatedLead.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while updating lead' });
  }
};

const deleteLead = async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.org_id;

  try {
    const deletedLead = await pool.query(
      'DELETE FROM leads WHERE id = $1 AND org_id = $2 RETURNING *',
      [id, orgId]
    );

    if (deletedLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while deleting lead' });
  }
};

module.exports = { createLead, getLeads, updateLeadStatus, updateLead, deleteLead };