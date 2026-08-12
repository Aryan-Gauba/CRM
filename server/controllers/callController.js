const pool = require('../config/db');

const logCall = async (req, res) => {
  const { lead_id, duration_minutes, outcome, notes } = req.body;
  const user_id = req.user.id;
  const orgId = req.user.org_id;

  try {
    const newLog = await pool.query(
      'INSERT INTO call_logs (lead_id, user_id, duration_minutes, outcome, notes, org_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [lead_id, user_id, duration_minutes, outcome, notes, orgId]
    );
    res.status(201).json(newLog.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while logging call' });
  }
};

const getCallLogsForLead = async (req, res) => {
  const { leadId } = req.params;
  const orgId = req.user.org_id;
  try {
    const logs = await pool.query(
      `SELECT call_logs.*, users.name AS user_name 
       FROM call_logs 
       LEFT JOIN users ON call_logs.user_id = users.id 
       WHERE call_logs.lead_id = $1 AND call_logs.org_id = $2 ORDER BY call_logs.logged_at DESC`,
      [leadId, orgId]
    );
    res.json(logs.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching call logs' });
  }
};

module.exports = { logCall, getCallLogsForLead };