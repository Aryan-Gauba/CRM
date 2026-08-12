// server/controllers/orgController.js
const pool = require('../config/db');

// Get organization details including SMTP settings
const getOrgDetails = async (req, res) => {
  const orgId = req.user.org_id;
  try {
    const org = await pool.query(
      'SELECT id, name, smtp_user FROM organizations WHERE id = $1',
      [orgId]
    );
    if (org.rows.length === 0) return res.status(404).json({ error: 'Organization not found' });
    res.json(org.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching organization details' });
  }
};

// Update organization SMTP email settings (Admin only)
const updateOrgEmailSettings = async (req, res) => {
  const { smtp_user, smtp_pass } = req.body;
  const orgId = req.user.org_id;

  try {
    await pool.query(
      'UPDATE organizations SET smtp_user = $1, smtp_pass = $2 WHERE id = $3',
      [smtp_user, smtp_pass, orgId]
    );
    res.json({ message: 'Organization email integration updated successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error updating SMTP settings' });
  }
};

module.exports = { getOrgDetails, updateOrgEmailSettings };