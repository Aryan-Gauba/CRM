import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import './TableStyles.css'; 

const initialFormState = { name: '', company: '', email: '', phone: '', address: '', notes: '' };

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleAddClick = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (customer) => {
    setFormData({
      name: customer.name, company: customer.company || '', email: customer.email || '',
      phone: customer.phone || '', address: customer.address || '', notes: customer.notes || ''
    });
    setEditId(customer.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await api.put(`/customers/${editId}`, formData);
      else await api.post('/customers', formData);
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      alert('Failed to save customer.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        alert('Failed to delete customer.');
      }
    }
  };

  const filteredCustomers = customers.filter((c) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div>Loading customers...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Customers Directory</h1>
        <button className="primary-btn" onClick={handleAddClick}>+ Add Customer</button>
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

      <div className="table-container">
        <table className="crm-table">
          <thead>
            <tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.company || '-'}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>
                    <button onClick={() => handleEditClick(customer)} className="action-link">Edit</button>
                    <button onClick={() => handleDelete(customer.id)} className="action-link text-danger">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No customers found matching "{searchTerm}".</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Customer' : 'Add New Customer'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
          <div className="form-group"><label>Company</label><input type="text" name="company" value={formData.company} onChange={handleChange} /></div>
          <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
          <div className="form-group"><label>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} /></div>
          <div className="form-group"><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} /></div>
          <div className="form-group"><label>Notes</label><input type="text" name="notes" value={formData.notes} onChange={handleChange} /></div>
          
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-save">Save Customer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;