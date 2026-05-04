import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/elections').then(r => { setElections(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const getStatusClass = (s) => {
    if (s === 'active') return 'status-active';
    if (s === 'scheduled') return 'status-scheduled';
    if (s === 'completed') return 'status-completed';
    if (s === 'draft') return 'status-draft';
    return 'status-upcoming';
  };

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className="page-header animate-fade-in">
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🗳️</div>
          <h1><span className="gradient-text">{t('indianVotingCommission')}</span></h1>
          <p>{t('tagline')} — {t('tripleLock')}</p>
          {!user && (
            <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary btn-lg">{t('login')}</Link>
              <Link to="/register" className="btn btn-secondary btn-lg">{t('register')}</Link>
            </div>
          )}
          {user && (
            <div style={{ marginTop: 24 }}>
              <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'candidate' ? '/candidate/dashboard' : '/voter/dashboard'} className="btn btn-primary btn-lg">
                Go to {t('dashboard')} →
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        {!user && (
          <div className="stats-grid animate-slide-up" style={{ marginBottom: 48 }}>
            <div className="stat-card"><div className="stat-icon">🔐</div><div className="stat-label">Triple-Lock Auth</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 4 }}>OTP + Aadhaar + Face</div></div>
            <div className="stat-card"><div className="stat-icon">🛡️</div><div className="stat-label">Tamper-Proof</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 4 }}>SHA-256 Hash Chain</div></div>
            <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-label">Real-Time</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 4 }}>Live Election Status</div></div>
            <div className="stat-card"><div className="stat-icon">🌐</div><div className="stat-label">Multilingual</div><div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 4 }}>EN · हिंदी · தமிழ்</div></div>
          </div>
        )}

        {/* Elections */}
        <div className="dashboard-section">
          <h2><span className="section-icon">📋</span> {t('elections')}</h2>
          {loading ? <div className="spinner" /> : (
            <div className="elections-grid stagger-children">
              {elections.map(e => (
                <Link to={`/election/${e._id}`} key={e._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="election-card-wrapper">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className={`status-badge ${getStatusClass(e.status)}`}>{e.status}</span>
                      <span className="election-type">{e.type || 'general'}</span>
                    </div>
                    <div className="election-title">{e.title}</div>
                    <div className="election-desc">{e.description}</div>
                    <div className="election-meta">
                      <span>🏛️ {e.constituency || 'National'}</span>
                      <span>👥 {e.candidates?.length || 0} {t('candidates')}</span>
                    </div>
                    <div className="election-meta" style={{ marginTop: 8 }}>
                      <span>📅 {new Date(e.startDate).toLocaleDateString()}</span>
                      <span>→ {new Date(e.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {elections.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No elections found</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
