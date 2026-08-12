// server/controllers/dashboardController.js
const pool = require('../config/db');

const getDashboardStats = async (req, res) => {
  const orgId = req.user.org_id;
  try {
    const leadsCount = await pool.query('SELECT COUNT(*) FROM leads WHERE org_id = $1', [orgId]);
    const customersCount = await pool.query('SELECT COUNT(*) FROM customers WHERE org_id = $1', [orgId]);
    const revenueResult = await pool.query("SELECT SUM(deal_value) as total_revenue FROM leads WHERE status = 'Won' AND org_id = $1", [orgId]);
    const totalRevenue = revenueResult.rows[0].total_revenue || 0;
    
    const dealsWon = await pool.query("SELECT COUNT(*) FROM leads WHERE status = 'Won' AND org_id = $1", [orgId]);
    const dealsLost = await pool.query("SELECT COUNT(*) FROM leads WHERE status = 'Lost' AND org_id = $1", [orgId]);
    
    const pipelineStats = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM leads 
      WHERE org_id = $1
      GROUP BY status
    `, [orgId]);

    const upcomingTasks = await pool.query(`
      SELECT tasks.id, tasks.title, tasks.type, tasks.due_date 
      FROM tasks 
      WHERE tasks.status = 'Pending' AND tasks.due_date >= CURRENT_DATE AND tasks.org_id = $1
      ORDER BY tasks.due_date ASC 
      LIMIT 5
    `, [orgId]);

    res.json({
      totalLeads: parseInt(leadsCount.rows[0].count),
      totalCustomers: parseInt(customersCount.rows[0].count),
      dealsWon: parseInt(dealsWon.rows[0].count),
      dealsLost: parseInt(dealsLost.rows[0].count),
      totalRevenue: parseFloat(totalRevenue),
      pipeline: pipelineStats.rows.map(row => ({
        name: row.status,
        value: parseInt(row.count)
      })),
      upcomingTasks: upcomingTasks.rows
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error fetching dashboard stats' });
  }
};

module.exports = { getDashboardStats };