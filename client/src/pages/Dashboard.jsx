// client/src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p style={{ color: '#666' }}>Welcome back, {user?.name} ({user?.role})</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Leads</h3>
          <p className="metric-value">{stats.totalLeads}</p>
        </div>
        <div className="metric-card">
          <h3>Total Customers</h3>
          <p className="metric-value">{stats.totalCustomers}</p>
        </div>
        <div className="metric-card" style={{ borderLeftColor: '#28a745' }}>
          <h3>Deals Won</h3>
          <p className="metric-value">{stats.dealsWon}</p>
        </div>
        <div className="metric-card" style={{ borderLeftColor: '#dc3545' }}>
          <h3>Deals Lost</h3>
          <p className="metric-value">{stats.dealsLost}</p>
        </div>
        <div className="metric-card" style={{ borderLeftColor: '#f39c12' }}>
        <h3>Total Revenue</h3>
        <p className="metric-value">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        </div>
      </div>

      <div className="dashboard-widgets">
        <div className="widget-card chart-widget">
          <h3>Sales Pipeline Distribution</h3>
          <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
            <ResponsiveContainer>
              <BarChart data={stats.pipeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="widget-card tasks-widget">
          <h3>Upcoming Follow-ups</h3>
          <ul className="tasks-list">
            {stats.upcomingTasks.length > 0 ? (
              stats.upcomingTasks.map(task => (
                <li key={task.id} className="task-item">
                  <div className="task-info">
                    <strong>{task.title}</strong>
                    <span>{task.type}</span>
                  </div>
                  <div className="task-date">
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </li>
              ))
            ) : (
              <p style={{ color: '#888', marginTop: '1rem' }}>No pending follow-ups scheduled.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;