import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', constituency: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="gradient-text">{t('registerTitle')}</h1>
        <p className="auth-subtitle">Join the Indian Voting Commission</p>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('name')}</label>
            <input type="text" className="form-input" value={form.name} onChange={update('name')} placeholder="Enter your full name" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input type="email" className="form-input" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('phone')}</label>
            <input type="tel" className="form-input" value={form.phone} onChange={update('phone')} placeholder="10-digit mobile number" maxLength={10} />
          </div>
          <div className="form-group">
            <label className="form-label">Constituency</label>
            <input type="text" className="form-input" value={form.constituency} onChange={update('constituency')} placeholder="e.g., Mumbai North" />
          </div>
          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input type="password" className="form-input" value={form.password} onChange={update('password')} placeholder="Min 6 characters" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '...' : t('register')}
          </button>
          <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Already have an account? <Link to="/login">{t('login')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
