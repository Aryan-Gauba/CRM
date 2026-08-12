const pool = require('../config/db');

const getReportData = async (req, res) => {
  const orgId = req.user.org_id;
  try {
    const totalLeadsRes = await pool.query('SELECT COUNT(*) FROM leads WHERE org_id = $1', [orgId]);
    const wonLeadsRes = await pool.query("SELECT COUNT(*) FROM leads WHERE status = 'Won' AND org_id = $1", [orgId]);
    const lostLeadsRes = await pool.query("SELECT COUNT(*) FROM leads WHERE status = 'Lost' AND org_id = $1", [orgId]);
    const revenueRes = await pool.query("SELECT SUM(deal_value) FROM leads WHERE status = 'Won' AND org_id = $1", [orgId]);
    
    const leadsByStatusRes = await pool.query(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(deal_value), 0) as total_value 
      FROM leads 
      WHERE org_id = $1
      GROUP BY status
    `, [orgId]);

    const totalLeads = parseInt(totalLeadsRes.rows[0].count) || 0;
    const wonLeads = parseInt(wonLeadsRes.rows[0].count) || 0;
    const lostLeads = parseInt(lostLeadsRes.rows[0].count) || 0;
    const totalRevenue = parseFloat(revenueRes.rows[0].sum) || 0;

    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    res.json({
      summary: {
        totalLeads,
        wonLeads,
        lostLeads,
        totalRevenue,
        conversionRate: `${conversionRate}%`
      },
      pipelineBreakdown: leadsByStatusRes.rows
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error generating reports' });
  }
};

module.exports = { getReportData };