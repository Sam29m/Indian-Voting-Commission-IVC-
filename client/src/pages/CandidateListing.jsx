import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function CandidateListing() {
  const { t } = useLanguage();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/elections').then(r => { setElections(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="container"><div className="spinner" /></div></div>;

  const getStatusClass = (s) => `status-${s === 'active' ? 'active' : s === 'scheduled' ? 'scheduled' : s === 'completed' ? 'completed' : 'draft'}`;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in">
          <h1><span className="gradient-text">{t('elections')}</span></h1>
          <p>Browse all elections and their candidates</p>
        </div>

        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {elections.map(election => (
            <div key={election._id} className="glass-card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: '1.375rem', marginBottom: 4 }}>{election.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{election.description?.substring(0, 100)}...</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`status-badge ${getStatusClass(election.status)}`}>{election.status}</span>
                  <span className="election-type">{election.type || 'general'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <span>🏛️ {election.constituency || 'National'}</span>
                <span>•</span>
                <span>📅 {new Date(election.startDate).toLocaleDateString()} → {new Date(election.endDate).toLocaleDateString()}</span>
              </div>

              <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>👥 {t('candidates')} ({election.candidates?.length || 0})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                {election.candidates?.map(c => (
                  <div key={c._id} style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.5rem', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>{c.symbol || '🏛️'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{c.party}</div>
                      {election.status === 'completed' && c.voteCount !== undefined && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-accent)', marginTop: 2 }}>🗳️ {c.voteCount} votes</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                {(election.status === 'active' || (new Date() >= new Date(election.startDate) && new Date() <= new Date(election.endDate))) && (
                  <Link to={`/vote/${election._id}`} className="btn btn-primary btn-sm">{t('castVote')} →</Link>
                )}
                <Link to={`/election/${election._id}`} className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }}>View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
