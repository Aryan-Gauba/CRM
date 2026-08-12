// client/src/pages/OrgSettings.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const OrgSettings = () => {
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await api.get('/org');
        setSmtpUser(res.data.smtp_user || '');
      } catch (err) {
        setError('Failed to load organization settings');
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.put('/org/smtp', { smtp_user: smtpUser, smtp_pass: smtpPass });
      setMessage('SMTP settings updated successfully!');
      setSmtpPass(''); // Clear password field for security
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update settings (Admin access required)');
    }
  };

  if (loading) return <div>Loading organization settings...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '650px' }}>
      <div className="page-header">
        <h1>Organization Email Integration</h1>
      </div>

      {message && <div style={{ color: 'green', marginBottom: '1rem', fontWeight: '500' }}>{message}</div>}
      {error && <div style={{ color: 'red', marginBottom: '1rem', fontWeight: '500' }}>{error}</div>}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sender Gmail Address (SMTP User)</label>
          <input 
            type="email" 
            value={smtpUser} 
            onChange={(e) => setSmtpUser(e.target.value)} 
            placeholder="company@gmail.com"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
            required 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Google App Password (SMTP Pass)</label>
          <input 
            type="password" 
            value={smtpPass} 
            onChange={(e) => setSmtpPass(e.target.value)} 
            placeholder="Enter 16-character app password"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
            required 
          />
          <div style={{ background: '#f8f9fa', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e9ecef', marginTop: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>How to generate a Google App Password:</p>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.4' }}>
              <li>Ensure 2-Step Verification is turned on in your Google Account.</li>
              <li>Go to your Google Account security settings and search for <strong>App passwords</strong>.</li>
              <li>Type a name (e.g., &quot;CRM System&quot;) and click <strong>Create</strong>.</li>
              <li>Copy the generated 16-character code and paste it here.</li>
            </ol>
            <a 
              href="https://myaccount.google.com/apppasswords" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'inline-block', marginTop: '0.5rem', color: '#007bff', textDecoration: 'none', fontWeight: '500' }}
            >
              🔗 Open Google App Passwords Page
            </a>
          </div>
        </div>

        <button type="submit" className="primary-btn" style={{ marginTop: '0.5rem', padding: '0.75rem', cursor: 'pointer' }}>
          Save Email Configuration
        </button>
      </form>
    </div>
  );
};

export default OrgSettings;