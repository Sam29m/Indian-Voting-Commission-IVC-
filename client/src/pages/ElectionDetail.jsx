import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function ElectionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    api.get(`/elections/${id}`).then(r => { setElection(r.data); setLoading(false); }).catch(() => setLoading(false));
    if (user) {
      api.get(`/votes/check/${id}`).then(r => setHasVoted(r.data.hasVoted)).catch(() => {});
    }
  }, [id, user]);

  if (loading) return <div className="page"><div className="container"><div className="spinner" /></div></div>;
  if (!election) return <div className="page"><div className="container"><p>Election not found</p></div></div>;

  const isActive = election.status === 'active' || (new Date() >= new Date(election.startDate) && new Date() <= new Date(election.endDate));

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="animate-fade-in">
          <Link to="/elections" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>← Back to Elections</Link>

          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <span className={`status-badge status-${election.status}`}>{election.status}</span>
              <span className="election-type">{election.type || 'general'}</span>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>{election.title}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{election.description}</p>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 32 }}>
              <div className="stat-card"><div className="stat-icon">🏛️</div><div className="stat-value" style={{ fontSize: '1rem' }}>{election.constituency || 'National'}</div><div className="stat-label">Constituency</div></div>
              <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{election.candidates?.length || 0}</div><div className="stat-label">{t('candidates')}</div></div>
              <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-value" style={{ fontSize: '0.875rem' }}>{new Date(election.startDate).toLocaleDateString()}</div><div className="stat-label">Start Date</div></div>
              <div className="stat-card"><div className="stat-icon">🏁</div><div className="stat-value" style={{ fontSize: '0.875rem' }}>{new Date(election.endDate).toLocaleDateString()}</div><div className="stat-label">End Date</div></div>
            </div>

            <h2 style={{ marginBottom: 16 }}>👥 {t('candidates')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
              {election.candidates?.map((c, i) => (
                <div key={c._id || i} className="glass-card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: '2rem', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>{c.symbol || '🏛️'}</span>
                    <div>
                      <h3 style={{ fontSize: '1.125rem' }}>{c.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{c.party}</p>
                    </div>
                  </div>
                  {c.manifesto && <p style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.manifesto}</p>}
                  {election.status === 'completed' && c.voteCount !== undefined && (
                    <div style={{ marginTop: 12, padding: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <span style={{ color: 'var(--text-accent)', fontWeight: 700 }}>🗳️ {c.voteCount} votes</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {user && isActive && !hasVoted && (
              <Link to={`/vote/${election._id}`} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                🗳️ {t('castVote')}
              </Link>
            )}
            {hasVoted && (
              <div className="alert alert-success">✅ You have already voted in this election</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
