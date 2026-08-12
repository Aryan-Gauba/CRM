// client/src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './TableStyles.css';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading predictive analytics...</div>;

  const summary = data?.summary || {};
  const totalLeads = Number(summary.total_leads || 0);
  const dealsWon = Number(summary.deals_won || 0);
  const winRate = totalLeads > 0 ? Math.round((dealsWon / totalLeads) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Predictive Sales Analytics & Forecasting</h1>
      </div>

      {/* Top Predictive Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Projected Revenue Forecast</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#34d399' }}>${Number(data?.projectedForecast || 0).toLocaleString()}</h2>
          <small style={{ color: 'var(--text-muted)' }}>Estimated via stage-probability weighting</small>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Open Active Pipeline</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#3b82f6' }}>${Number(summary.open_pipeline_value || 0).toLocaleString()}</h2>
          <small style={{ color: 'var(--text-muted)' }}>In-progress deal values</small>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Predicted Win Ratio</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#fbbf24' }}>{winRate}%</h2>
          <small style={{ color: 'var(--text-muted)' }}>Historical conversion efficiency</small>
        </div>
      </div>

      {/* Stage Breakdown Table for Forecasting */}
      <div className="table-container">
        <h3 style={{ padding: '1.25rem', margin: 0, borderBottom: '1px solid var(--border-color)', fontSize: '1rem', color: 'var(--text-color)' }}>
          Pipeline Stage Velocity & Value Breakdown
        </h3>
        <table className="crm-table">
          <thead>
            <tr>
              <th>Pipeline Stage</th>
              <th>Deal Count</th>
              <th>Total Stage Value</th>
            </tr>
          </thead>
          <tbody>
            {data?.stages?.length > 0 ? data.stages.map((stage) => (
              <tr key={stage.status}>
                <td><strong>{stage.status}</strong></td>
                <td>{stage.count}</td>
                <td>${Number(stage.total_value).toLocaleString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>No stage data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;