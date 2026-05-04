import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="container"><div className="spinner" /></div></div>;

  const s = data?.stats || {};

  return (
    <div className="page">
      <div className="container">
        <div className="page-header animate-fade-in">
          <h1><span className="gradient-text">{t('adminDashboard')}</span></h1>
          <p>System Overview & Management Console</p>
        </div>

        <div className="stats-grid stagger-children">
          <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{s.totalUsers || 0}</div><div className="stat-label">{t('totalUsers')}</div></div>
          <div className="stat-card"><div className="stat-icon">🗳️</div><div className="stat-value">{s.totalVotes || 0}</div><div className="stat-label">Total Votes</div></div>
          <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-value">{s.totalElections || 0}</div><div className="stat-label">{t('totalElections')}</div></div>
          <div className="stat-card"><div className="stat-icon">🟢</div><div className="stat-value">{s.activeElections || 0}</div><div className="stat-label">{t('activeElections')}</div></div>
          <div className="stat-card"><div className="stat-icon">🎫</div><div className="stat-value">{s.openTickets || 0}</div><div className="stat-label">{t('openTickets')}</div></div>
          <div className="stat-card"><div className="stat-icon">🏛️</div><div className="stat-value">{s.candidateCount || 0}</div><div className="stat-label">Candidates</div></div>
        </div>

        {/* Recent Elections */}
        {data?.recentElections?.length > 0 && (
          <div className="dashboard-section">
            <h2><span className="section-icon">📋</span> Recent Elections</h2>
            <div className="glass-card" style={{ padding: 24 }}>
              <table className="data-table">
                <thead><tr><th>Title</th><th>Status</th><th>Type</th><th>Votes Cast</th></tr></thead>
                <tbody>
                  {data.recentElections.map(e => (
                    <tr key={e._id}>
                      <td><Link to={`/election/${e._id}`}>{e.title}</Link></td>
                      <td><span className={`status-badge status-${e.status}`}>{e.status}</span></td>
                      <td>{e.type || 'general'}</td>
                      <td>{e.totalVotesCast || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {data?.recentLogs?.length > 0 && (
          <div className="dashboard-section">
            <h2><span className="section-icon">📜</span> Recent Audit Logs</h2>
            <div className="glass-card" style={{ padding: 24 }}>
              <table className="data-table">
                <thead><tr><th>Action</th><th>User</th><th>Details</th><th>Severity</th><th>Time</th></tr></thead>
                <tbody>
                  {data.recentLogs.map((l, i) => (
                    <tr key={i}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{l.action}</span></td>
                      <td>{l.user || 'System'}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.details}</td>
                      <td><span className={`status-badge ${l.severity === 'critical' ? 'status-active' : l.severity === 'warning' ? 'status-upcoming' : 'status-completed'}`}>{l.severity}</span></td>
                      <td>{new Date(l.time).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <h2><span className="section-icon">⚡</span> Admin Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/admin/create" className="btn btn-primary">+ Create Election</Link>
            <Link to="/support" className="btn btn-secondary">🎫 Manage Tickets</Link>
            <Link to="/elections" className="btn btn-secondary">📋 All Elections</Link>
            <Link to="/mitra" className="btn btn-secondary">🤖 Mitra AI</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
