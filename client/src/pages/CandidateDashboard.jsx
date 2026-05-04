import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/candidate').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="container"><div className="spinner" /></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in">
          <h1><span className="gradient-text">{t('candidateDashboard')}</span></h1>
          <p>{t('welcome')}, {user?.name}!</p>
        </div>

        <div className="stats-grid stagger-children">
          <div className="stat-card"><div className="stat-icon">🏛️</div><div className="stat-value">{data?.stats?.electionsRegistered || 0}</div><div className="stat-label">Elections Registered</div></div>
          <div className="stat-card"><div className="stat-icon">🗳️</div><div className="stat-value">{data?.stats?.totalVotesReceived || 0}</div><div className="stat-label">Votes Received</div></div>
          <div className="stat-card"><div className="stat-icon">🏷️</div><div className="stat-value" style={{ fontSize: '1.25rem' }}>{data?.stats?.party || 'Independent'}</div><div className="stat-label">Party</div></div>
        </div>

        {data?.elections?.length > 0 && (
          <div className="dashboard-section">
            <h2><span className="section-icon">📊</span> My Elections</h2>
            <div className="elections-grid stagger-children">
              {data.elections.map(e => (
                <div key={e._id} className="election-card-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className={`status-badge status-${e.status}`}>{e.status}</span>
                    <span style={{ color: 'var(--text-accent)', fontWeight: 700 }}>{e.myVotes} votes</span>
                  </div>
                  <div className="election-title">{e.title}</div>
                  <div className="election-meta" style={{ marginTop: 8 }}>
                    <span>{e.type}</span>
                    <span>{e.totalCandidates} candidates</span>
                  </div>
                  <Link to={`/election/${e._id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 16, width: '100%' }}>View Details</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <h2><span className="section-icon">⚡</span> Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/elections" className="btn btn-secondary">📋 Browse Elections</Link>
            <Link to="/mitra" className="btn btn-secondary">🤖 Ask Mitra</Link>
            <Link to="/support" className="btn btn-secondary">🎫 Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
