import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'other', subject: '', description: '', priority: 'medium' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTickets = () => {
    api.get('/tickets').then(r => { setTickets(r.data.tickets || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/tickets', form);
      setSuccess('Ticket created successfully!');
      setShowForm(false);
      setForm({ category: 'other', subject: '', description: '', priority: 'medium' });
      fetchTickets();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create ticket'); }
  };

  const statusColor = { open: 'status-active', in_progress: 'status-scheduled', resolved: 'status-completed', closed: 'status-completed' };
  const priorityColor = { low: '#64748b', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in">
          <h1><span className="gradient-text">Support Tickets</span></h1>
          <p>Get help with any issues</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ marginBottom: 24 }}>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Ticket'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="glass-card animate-fade-in-scale" style={{ padding: 32, marginBottom: 32, maxWidth: 600 }}>
            <h3 style={{ marginBottom: 20 }}>Create Support Ticket</h3>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="login_issue">Login Issue</option>
                <option value="voting_issue">Voting Issue</option>
                <option value="aadhaar_issue">Aadhaar Issue</option>
                <option value="otp_issue">OTP Issue</option>
                <option value="face_recognition">Face Recognition</option>
                <option value="election_query">Election Query</option>
                <option value="technical_error">Technical Error</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required maxLength={200} placeholder="Brief description" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required maxLength={2000} placeholder="Detailed description of the issue" />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Submit Ticket</button>
          </form>
        )}

        {loading ? <div className="spinner" /> : (
          <div className="stagger-children">
            {tickets.length === 0 ? (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                <span style={{ fontSize: '3rem' }}>🎫</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>No tickets yet</p>
              </div>
            ) : tickets.map(ticket => (
              <div key={ticket._id} className="ticket-card">
                <div className="ticket-header">
                  <div>
                    <span className="ticket-subject">{ticket.subject}</span>
                    <span style={{ marginLeft: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.category?.replace('_', ' ')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${priorityColor[ticket.priority]}22`, color: priorityColor[ticket.priority] }}>{ticket.priority}</span>
                    <span className={`status-badge ${statusColor[ticket.status] || ''}`}>{ticket.status?.replace('_', ' ')}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{ticket.description?.substring(0, 150)}...</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                {ticket.responses?.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                    {ticket.responses.map((r, i) => (
                      <div key={i} style={{ fontSize: '0.875rem', marginBottom: 8, padding: 8, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                        <strong>{r.authorName}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({r.authorRole})</span>
                        <p style={{ marginTop: 4 }}>{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
