const pool = require('../config/db');

const getSalesAnalytics = async (req, res) => {
  const orgId = req.user.org_id;
  try {
    const statsQuery = await pool.query(`
      SELECT 
        COUNT(*) AS total_leads,
        SUM(CASE WHEN status = 'Won' THEN deal_value ELSE 0 END) AS total_revenue,
        SUM(CASE WHEN status NOT IN ('Won', 'Lost') THEN deal_value ELSE 0 END) AS open_pipeline_value,
        COUNT(CASE WHEN status = 'Won' THEN 1 END) AS deals_won,
        COUNT(CASE WHEN status = 'Lost' THEN 1 END) AS deals_lost
      FROM leads
      WHERE org_id = $1
    `, [orgId]);

    const stageQuery = await pool.query(`
      SELECT 
        status, 
        COUNT(*) as count, 
        COALESCE(SUM(deal_value), 0) as total_value 
      FROM leads 
      WHERE org_id = $1
      GROUP BY status
    `, [orgId]);

    const stageWeights = {
      'New Lead': 0.10,
      'Contacted': 0.25,
      'Qualified': 0.50,
      'Proposal Sent': 0.75,
      'Negotiation': 0.90,
      'Won': 1.00,
      'Lost': 0.00
    };

    let projectedForecast = 0;
    stageQuery.rows.forEach(row => {
      const weight = stageWeights[row.status] || 0;
      projectedForecast += Number(row.total_value) * weight;
    });

    res.json({
      summary: statsQuery.rows[0],
      stages: stageQuery.rows,
      projectedForecast: Math.round(projectedForecast)
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error while calculating sales analytics' });
  }
};

module.exports = { getSalesAnalytics };