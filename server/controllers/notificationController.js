const pool = require('../config/db');

const getNotifications = async (req, res) => {
  const userId = req.user.id;
  const orgId = req.user.org_id;

  try {
    const overdueTasks = await pool.query(`
      SELECT tasks.id, tasks.title, tasks.due_date, leads.name as lead_name 
      FROM tasks 
      LEFT JOIN leads ON tasks.lead_id = leads.id 
      WHERE tasks.assigned_to = $1 AND tasks.status = 'Pending' AND tasks.due_date < NOW() AND tasks.org_id = $2
    `, [userId, orgId]);

    const dueTodayTasks = await pool.query(`
      SELECT tasks.id, tasks.title, tasks.due_date, leads.name as lead_name 
      FROM tasks 
      LEFT JOIN leads ON tasks.lead_id = leads.id 
      WHERE tasks.assigned_to = $1 AND tasks.status = 'Pending' AND tasks.due_date::date = CURRENT_DATE AND tasks.org_id = $2
    `, [userId, orgId]);

    const notifications = [
      ...overdueTasks.rows.map(t => ({
        id: `overdue-${t.id}`,
        type: 'overdue',
        message: `OVERDUE: "${t.title}" for ${t.lead_name || 'Lead'}`
      })),
      ...dueTodayTasks.rows.map(t => ({
        id: `today-${t.id}`,
        type: 'today',
        message: `DUE TODAY: "${t.title}" for ${t.lead_name || 'Lead'}`
      }))
    ];

    res.json({
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
};

module.exports = { getNotifications };