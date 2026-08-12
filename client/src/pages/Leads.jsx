// client/src/pages/Leads.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import './TableStyles.css';

const initialFormState = {
  name: '', company: '', email: '', phone: '', source: 'Website', status: 'New Lead', deal_value: 0
};

const pipelineStages = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [view, setView] = useState('table'); 

  // AI Scoring State
  const [aiInsight, setAiInsight] = useState(null);
  const [isScoring, setIsScoring] = useState(false);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // NEW: Communication Modal State (Email & Call Logging)
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'email' | 'calls'
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
  const [callForm, setCallForm] = useState({ duration_minutes: 5, outcome: 'Connected', notes: '' });
  const [callLogs, setCallLogs] = useState([]);
  const [emailStatus, setEmailStatus] = useState('');

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddClick = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleEditClick = async (lead) => {
    setFormData({
      name: lead.name, company: lead.company || '', email: lead.email || '',
      phone: lead.phone || '', source: lead.source || 'Website', status: lead.status, deal_value: lead.deal_value || 0
    });
    setEditId(lead.id);
    setIsEditing(true);
    setAiInsight(null); 
    setActiveTab('details');
    setEmailForm({ subject: '', message: `Hi ${lead.name},\n\n` });
    setIsModalOpen(true);

    // Fetch call history for this lead
    try {
      const res = await api.get(`/calls/lead/${lead.id}`);
      setCallLogs(res.data);
    } catch (err) {
      console.error('Error fetching call logs:', err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await api.put(`/leads/${editId}`, formData);
      else await api.post('/leads', formData);
      setIsModalOpen(false);
      fetchLeads(); 
    } catch (error) {
      alert('Failed to save lead.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads(); 
      } catch (error) {
        alert('Failed to delete lead.');
      }
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/leads/${id}/status`, { status: newStatus });
      fetchLeads(); 
    } catch (error) {
      alert('Failed to update lead status');
    }
  };

  const handleGetAiScore = async () => {
    setIsScoring(true);
    try {
      const response = await api.get(`/ai/score/${editId}`);
      setAiInsight(response.data);
    } catch (error) {
      alert('Failed to generate AI score.');
    } finally {
      setIsScoring(false);
    }
  };

  // Send Email Action
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailStatus('Sending...');
    try {
      await api.post('/emails/send', {
        to: formData.email,
        subject: emailForm.subject,
        message: emailForm.message
      });
      setEmailStatus('Email sent successfully! ✔');
      setEmailForm({ subject: '', message: '' });
    } catch (err) {
      setEmailStatus('Failed to send email. Check configuration.');
    }
  };

  // Log Call Action
  const handleLogCall = async (e) => {
    e.preventDefault();
    try {
      await api.post('/calls', {
        lead_id: editId,
        duration_minutes: Number(callForm.duration_minutes),
        outcome: callForm.outcome,
        notes: callForm.notes
      });
      setCallForm({ duration_minutes: 5, outcome: 'Connected', notes: '' });
      // Refresh call logs
      const res = await api.get(`/calls/lead/${editId}`);
      setCallLogs(res.data);
      alert('Call logged successfully!');
    } catch (err) {
      alert('Failed to log call.');
    }
  };

  const filteredLeads = leads.filter((lead) => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div>Loading leads...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Leads Pipeline</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={`toggle-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>List View</button>
          <button className={`toggle-btn ${view === 'board' ? 'active' : ''}`} onClick={() => setView('board')}>Board View</button>
          <button className="primary-btn" onClick={handleAddClick}>+ Add Lead</button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input 
            type="text" 
            placeholder="Search by name or company..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="crm-search-input"
        />
      </div>

      {view === 'table' ? (
        <div className="table-container">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Status</th>
                <th>AI Score</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.company}</td>
                <td>
                  <span className={`status-badge ${lead.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {lead.status}
                  </span>
                </td>
                <td>
                  {lead.ai_score !== null && lead.ai_score !== undefined ? (
                    <span style={{
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem',
                      backgroundColor: lead.ai_score > 70 ? '#d4edda' : lead.ai_score > 40 ? '#fff3cd' : '#f8d7da',
                      color: lead.ai_score > 70 ? '#155724' : lead.ai_score > 40 ? '#856404' : '#721c24'
                    }}>
                      🤖 {lead.ai_score}%
                    </span>
                  ) : (
                    <span style={{ color: '#aaa', fontSize: '0.85rem' }}>N/A</span>
                  )}
                </td>
                <td>{lead.assigned_user_name || 'Unassigned'}</td>
                <td>
                  <button onClick={() => handleEditClick(lead)} className="action-link">Edit</button>
                  <button onClick={() => handleDelete(lead.id)} className="action-link text-danger">Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="kanban-board">
          {pipelineStages.map((stage) => (
            <div className="kanban-column" key={stage}>
              <h3 className="kanban-col-header">{stage}</h3>
              <div className="kanban-cards-container">
                {filteredLeads.filter(l => l.status === stage).map(lead => (
                  <div className="kanban-card" key={lead.id}>
                    <h4>{lead.name}</h4>
                    <p>{lead.company}</p>
                    <div className="kanban-card-actions">
                      <select 
                        value={lead.status} 
                        onChange={(e) => handleQuickStatusChange(lead.id, e.target.value)}
                        className="quick-status-select"
                      >
                        {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div>
                        <button onClick={() => handleEditClick(lead)} className="icon-btn">✎</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead Edit / Add & Communication Hub Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? `Manage Lead: ${formData.name}` : 'Add New Lead'}>
        
        {/* Navigation tabs for editing mode */}
        {isEditing && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button type="button" className={`toggle-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details & AI</button>
            <button type="button" className={`toggle-btn ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>✉️ Send Email</button>
            <button type="button" className={`toggle-btn ${activeTab === 'calls' ? 'active' : ''}`} onClick={() => setActiveTab('calls')}>📞 Call Logs ({callLogs.length})</button>
          </div>
        )}

        {activeTab === 'details' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label>Company</label><input type="text" name="company" value={formData.company} onChange={handleChange} /></div>
            <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
            <div className="form-group"><label>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} /></div>
            <div className="form-group"><label>Deal Value ($)</label><input type="number" name="deal_value" value={formData.deal_value} onChange={handleChange} min="0" /></div>
            
            {isEditing && (
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {isEditing && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--sidebar-hover)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiInsight ? '1rem' : '0' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-color)' }}>🤖 Predictive AI Score</h4>
                  {!aiInsight && (
                    <button type="button" onClick={handleGetAiScore} disabled={isScoring} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      {isScoring ? 'Analyzing...' : 'Generate Insight'}
                    </button>
                  )}
                </div>
                {aiInsight && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ backgroundColor: aiInsight.score > 70 ? 'rgba(16, 185, 129, 0.15)' : '#fff3cd', color: aiInsight.score > 70 ? '#34d399' : '#fbbf24', padding: '1rem', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                      {aiInsight.score}%
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{aiInsight.reason}</p>
                  </div>
                )}
              </div>
            )}
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-save">Save Lead</button>
            </div>
          </form>
        )}

        {/* Email Integration Tab */}
        {activeTab === 'email' && (
          <form onSubmit={handleSendEmail}>
            <div className="form-group"><label>To Email</label><input type="email" value={formData.email} disabled style={{ opacity: 0.7 }} /></div>
            <div className="form-group"><label>Subject *</label><input type="text" value={emailForm.subject} onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})} required placeholder="Enter email subject..." /></div>
            <div className="form-group"><label>Message *</label><textarea rows="5" value={emailForm.message} onChange={(e) => setEmailForm({...emailForm, message: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--card-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }} /></div>
            {emailStatus && <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#34d399' }}>{emailStatus}</p>}
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn-save" style={{ width: '100%' }}>Send Direct Email</button>
            </div>
          </form>
        )}

        {/* Call Logging Tab */}
        {activeTab === 'calls' && (
          <div>
            <form onSubmit={handleLogCall} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-color)' }}>Log a New Interaction</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Outcome</label>
                  <select value={callForm.outcome} onChange={(e) => setCallForm({...callForm, outcome: e.target.value})}>
                    <option value="Connected">Connected</option>
                    <option value="Voicemail">Voicemail</option>
                    <option value="No Answer">No Answer</option>
                    <option value="Busy">Busy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (Minutes)</label>
                  <input type="number" min="1" value={callForm.duration_minutes} onChange={(e) => setCallForm({...callForm, duration_minutes: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Call Notes</label>
                <input type="text" value={callForm.notes} onChange={(e) => setCallForm({...callForm, notes: e.target.value})} placeholder="e.g., Discussed pricing tier options..." />
              </div>
              <button type="submit" className="primary-btn" style={{ width: '100%' }}>+ Save Call Log</button>
            </form>

            <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-color)' }}>Previous Call History</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {callLogs.length > 0 ? callLogs.map((log) => (
                <div key={log.id} style={{ background: 'var(--sidebar-hover)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <span style={{ color: log.outcome === 'Connected' ? '#34d399' : '#fbbf24' }}>📞 {log.outcome} ({log.duration_minutes} mins)</span>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(log.logged_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-color)' }}>{log.notes || 'No notes added.'}</p>
                  <small style={{ color: 'var(--text-muted)' }}>Logged by: {log.user_name}</small>
                </div>
              )) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No calls logged for this lead yet.</p>
              )}
            </div>
          </div>
        )}

      </Modal>
    </div>
  );
};

export default Leads;