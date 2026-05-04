import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateElection() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', type: 'general', constituency: 'National',
    startDate: '', endDate: '',
    candidates: [{ name: '', party: '', symbol: '🏛️', manifesto: '' }, { name: '', party: '', symbol: '🏛️', manifesto: '' }],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateCandidate = (idx, field) => (e) => {
    const candidates = [...form.candidates];
    candidates[idx] = { ...candidates[idx], [field]: e.target.value };
    setForm({ ...form, candidates });
  };

  const addCandidate = () => {
    setForm({ ...form, candidates: [...form.candidates, { name: '', party: '', symbol: '🏛️', manifesto: '' }] });
  };

  const removeCandidate = (idx) => {
    if (form.candidates.length <= 2) return;
    setForm({ ...form, candidates: form.candidates.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, candidates: form.candidates.filter(c => c.name) };
      await api.post('/elections', payload);
      navigate('/elections');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create election');
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="page-header animate-fade-in">
          <h1><span className="gradient-text">Create Election</span></h1>
          <p>Set up a new election for the Indian Voting Commission</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="glass-card animate-fade-in" style={{ padding: 32 }}>
          <div className="form-group">
            <label className="form-label">Election Title</label>
            <input className="form-input" value={form.title} onChange={update('title')} required placeholder="e.g., 2026 Lok Sabha Election" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={update('description')} required placeholder="Describe this election..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={update('type')}>
                <option value="general">General</option>
                <option value="state">State</option>
                <option value="local">Local</option>
                <option value="referendum">Referendum</option>
                <option value="by-election">By-Election</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Constituency</label>
              <input className="form-input" value={form.constituency} onChange={update('constituency')} placeholder="National" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="datetime-local" className="form-input" value={form.startDate} onChange={update('startDate')} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="datetime-local" className="form-input" value={form.endDate} onChange={update('endDate')} required />
            </div>
          </div>

          <h3 style={{ marginBottom: 16, marginTop: 8 }}>Candidates</h3>
          {form.candidates.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr auto', gap: 8, marginBottom: 12, alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Symbol</label>
                <input className="form-input" value={c.symbol} onChange={updateCandidate(i, 'symbol')} style={{ textAlign: 'center' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name</label>
                <input className="form-input" value={c.name} onChange={updateCandidate(i, 'name')} placeholder="Candidate name" required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Party</label>
                <input className="form-input" value={c.party} onChange={updateCandidate(i, 'party')} placeholder="Party name" />
              </div>
              <button type="button" onClick={() => removeCandidate(i)} className="btn btn-danger btn-sm" disabled={form.candidates.length <= 2}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addCandidate} className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>+ Add Candidate</button>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating...' : '🗳️ Create Election'}
          </button>
        </form>
      </div>
    </div>
  );
}
