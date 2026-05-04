import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function VoterDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/voter').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="container"><div className="spinner" /></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in">
          <h1><span className="gradient-text">{t('voterDashboard')}</span></h1>
          <p>{t('welcome')}, {user?.name}! 🇮🇳</p>
        </div>

        <div className="stats-grid stagger-children">
          <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-value">{data?.stats?.totalElections || 0}</div><div className="stat-label">{t('totalElections')}</div></div>
          <div className="stat-card"><div className="stat-icon">🟢</div><div className="stat-value">{data?.stats?.activeElections || 0}</div><div className="stat-label">{t('activeElections')}</div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{data?.stats?.votesPlaced || 0}</div><div className="stat-label">{t('votesPlaced')}</div></div>
          <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-value">{data?.stats?.upcomingCount || 0}</div><div className="stat-label">{t('electionUpcoming')}</div></div>
        </div>

        {/* Active Elections */}
        {data?.activeElections?.length > 0 && (
          <div className="dashboard-section">
            <h2><span className="section-icon">🗳️</span> {t('activeElections')}</h2>
            <div className="elections-grid stagger-children">
              {data.activeElections.map(e => (
                <Link to={`/vote/${e._id}`} key={e._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="election-card-wrapper">
                    <span className="status-badge status-active">{t('electionActive')}</span>
                    <div className="election-title" style={{ marginTop: 12 }}>{e.title}</div>
                    <div className="election-meta" style={{ marginTop: 8 }}>
                      <span>{e.type || 'general'}</span>
                      <span>{e.constituency || 'National'}</span>
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 16, width: '100%' }}>{t('castVote')} →</button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Votes */}
        {data?.recentVotes?.length > 0 && (
          <div className="dashboard-section">
            <h2><span className="section-icon">📜</span> Recent Votes</h2>
            <div className="glass-card" style={{ padding: 24 }}>
              <table className="data-table">
                <thead><tr><th>Receipt</th><th>Election</th><th>Candidate</th><th>Date</th></tr></thead>
                <tbody>
                  {data.recentVotes.map(v => (
                    <tr key={v.receiptId}>
                      <td><Link to={`/receipt/${v.receiptId}`} style={{ fontFamily: 'monospace' }}>{v.receiptId}</Link></td>
                      <td>{v.election}</td>
                      <td>{v.candidateName} <span style={{ color: 'var(--text-muted)' }}>({v.candidateParty})</span></td>
                      <td>{new Date(v.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2><span className="section-icon">⚡</span> Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/elections" className="btn btn-secondary">📋 All Elections</Link>
            <Link to="/mitra" className="btn btn-secondary">🤖 Ask Mitra</Link>
            <Link to="/support" className="btn btn-secondary">🎫 Support Tickets</Link>
            <Link to="/settings/security" className="btn btn-secondary">🔐 Security Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
