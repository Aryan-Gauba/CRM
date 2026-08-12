// client/src/pages/Tasks.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { AuthContext } from '../context/AuthContext';
import './TableStyles.css';

const initialFormState = {
  title: '',
  type: 'Follow Up',
  due_date: '',
  lead_id: '',
  assigned_to: ''
};

const taskTypes = ['Call', 'Email', 'Meeting', 'Demo', 'Follow Up'];

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'completed'
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all'); // 'all' | 'Admin' | 'Sales Manager' | 'Sales Executive'
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    try {
      const [tasksRes, leadsRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/leads'),
        api.get('/auth/users')
      ]);
      setTasks(tasksRes.data);
      setLeads(leadsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClick = () => {
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setIsModalOpen(false);
      fetchData(); 
    } catch (error) {
      console.error('Error scheduling task:', error);
      alert('Failed to schedule task.');
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await api.put(`/tasks/${id}/status`, { status: 'Completed' });
      fetchData(); 
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to complete task.');
    }
  };

  // Helper to match task assignee role
  const getAssigneeRole = (assignedId) => {
    const foundUser = users.find(u => u.id === assignedId);
    return foundUser ? foundUser.role : '';
  };

  // Filter tasks based on selected tab category and role filter
  const filteredTasks = tasks.filter((task) => {
    // 1. Status Filter Tab check
    if (filterTab === 'pending' && task.status !== 'Pending') return false;
    if (filterTab === 'completed' && task.status !== 'Completed') return false;

    // 2. Role Filter check (for Admins/Managers)
    if (selectedRoleFilter !== 'all') {
      const assigneeRole = getAssigneeRole(task.assigned_to);
      if (assigneeRole !== selectedRoleFilter) return false;
    }

    return true;
  });

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Task & Follow-up Management</h1>
        <button className="primary-btn" onClick={handleAddClick}>+ Schedule Follow-up</button>
      </div>

      {/* Categorisation Tab Bar & Role Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`toggle-btn ${filterTab === 'all' ? 'active' : ''}`} 
            onClick={() => setFilterTab('all')}
          >
            All Tasks ({tasks.length})
          </button>
          <button 
            className={`toggle-btn ${filterTab === 'pending' ? 'active' : ''}`} 
            onClick={() => setFilterTab('pending')}
          >
            Pending ({tasks.filter(t => t.status === 'Pending').length})
          </button>
          <button 
            className={`toggle-btn ${filterTab === 'completed' ? 'active' : ''}`} 
            onClick={() => setFilterTab('completed')}
          >
            Completed ({tasks.filter(t => t.status === 'Completed').length})
          </button>
        </div>

        {/* Role Filter Dropdown for Admins and Managers */}
        {(user?.role === 'Admin' || user?.role === 'Sales Manager') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter by Role:</span>
            <select 
              value={selectedRoleFilter} 
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Roles</option>
              {user?.role === 'Admin' && <option value="Admin">Admin</option>}
              <option value="Sales Manager">Sales Manager</option>
              <option value="Sales Executive">Sales Executive</option>
            </select>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Type</th>
              <th>Related Lead</th>
              <th>Assigned To</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{filteredTasks.length > 0 ? filteredTasks.map((task) => (
            <tr key={task.id} style={{ opacity: task.status === 'Completed' ? 0.6 : 1 }}>
              <td><strong>{task.title}</strong></td>
              <td>{task.type}</td>
              <td>{task.lead_name || 'N/A'}</td>
              <td>
                <span style={{ fontWeight: 500, color: 'var(--text-color)' }}>
                  {task.assignee_name || 'Unassigned'}
                </span>
              </td>
              <td>{new Date(task.due_date).toLocaleString()}</td>
              <td>
                <span className={`status-badge ${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </td>
              <td>
                {task.status === 'Pending' ? (
                  <button onClick={() => handleCompleteTask(task.id)} className="action-link" style={{ color: '#28a745' }}>
                    ✔ Mark Complete
                  </button>
                ) : (
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>Done</span>
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No tasks found in this view.</td>
            </tr>
          )}</tbody>
        </table>
      </div>

      {/* Schedule Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Follow-up">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title / Description *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Check in on pricing proposal" />
          </div>
          
          <div className="form-group">
            <label>Interaction Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              {taskTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Related Lead *</label>
            <select name="lead_id" value={formData.lead_id} onChange={handleChange} required>
              <option value="" disabled>Select a lead...</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>{lead.name} ({lead.company})</option>
              ))}
            </select>
          </div>

          {(user?.role === 'Admin' || user?.role === 'Sales Manager') && (
            <div className="form-group">
              <label>Assign To Team Member</label>
              <select name="assigned_to" value={formData.assigned_to} onChange={handleChange}>
                <option value="">Assign to myself (Default)</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Date & Time *</label>
            <input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleChange} required />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-save">Schedule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;