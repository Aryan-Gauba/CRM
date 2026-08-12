// client/src/pages/AiInsights.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './TableStyles.css';

const AiInsights = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScoredLeads = async () => {
      try {
        const response = await api.get('/leads');
        const scored = response.data
          .filter(l => l.ai_score !== null)
          .sort((a, b) => b.ai_score - a.ai_score);
        setLeads(scored);
      } catch (error) {
        console.error('Error loading AI insights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScoredLeads();
  }, []);

  if (loading) return <div>Analyzing lead predictive analytics...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>AI Predictive Lead Leaderboard</h1>
      </div>

      <div className="table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Company</th>
              <th>Deal Value</th>
              <th>AI Conversion Score</th>
              <th>Strategic AI Insight</th>
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td><strong>{lead.name}</strong></td>
                  <td>{lead.company || '-'}</td>
                  <td>${parseFloat(lead.deal_value || 0).toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      backgroundColor: lead.ai_score > 70 ? 'rgba(16, 185, 129, 0.15)' : lead.ai_score > 40 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: lead.ai_score > 70 ? '#34d399' : lead.ai_score > 40 ? '#fbbf24' : '#f87171',
                      border: `1px solid ${lead.ai_score > 70 ? 'rgba(16, 185, 129, 0.3)' : lead.ai_score > 40 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                      {lead.ai_score}%
                    </span>
                  </td>
                  {/* Fixed text styling so it inherits theme colors properly */}
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{lead.ai_reason}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  No AI scored leads found yet. Open a lead in the Leads page and click "Generate Insight".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AiInsights;