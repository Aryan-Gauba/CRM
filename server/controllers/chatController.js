// server/controllers/chatController.js
const pool = require('../config/db');

const getChatHistory = async (req, res) => {
  const orgId = req.user.org_id;
  try {
    const messages = await pool.query(`
      SELECT messages.*, users.name AS sender_name 
      FROM messages 
      LEFT JOIN users ON messages.sender_id = users.id 
      WHERE messages.org_id = $1
      ORDER BY messages.sent_at ASC 
      LIMIT 100
    `, [orgId]);
    res.json(messages.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching chat history' });
  }
};

module.exports = { getChatHistory };