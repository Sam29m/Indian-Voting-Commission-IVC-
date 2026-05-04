import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Security() {
  const { user, updateUser } = useAuth();
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handle2FASetup = async () => {
    setError(''); setStatus('');
    try {
      const { data } = await api.post('/auth/2fa/setup');
      setStatus(`2FA secret generated. Scan QR code in your authenticator app. Secret: ${data.secret}`);
    } catch (err) { setError(err.response?.data?.message || 'Failed to setup 2FA'); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="page-header animate-fade-in">
          <h1><span className="gradient-text">Security Settings</span></h1>
          <p>Manage your authentication methods</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {status && <div className="alert alert-success">{status}</div>}

        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>📱 Two-Factor Authentication</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9375rem' }}>
            Status: {user?.twoFactorEnabled ? <span style={{ color: 'var(--success)' }}>✅ Enabled</span> : <span style={{ color: 'var(--text-muted)' }}>Not enabled</span>}
          </p>
          <button className="btn btn-secondary" onClick={handle2FASetup}>
            {user?.twoFactorEnabled ? 'Reset 2FA' : 'Setup 2FA'}
          </button>
        </div>

        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>👤 Face Recognition</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9375rem' }}>
            Status: {user?.faceEnabled ? <span style={{ color: 'var(--success)' }}>✅ Enabled</span> : <span style={{ color: 'var(--text-muted)' }}>Not enabled</span>}
          </p>
          <button className="btn btn-secondary">Setup Face Recognition</button>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>🪪 Aadhaar Verification</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9375rem' }}>
            Status: {user?.aadhaarVerified ? <span style={{ color: 'var(--success)' }}>✅ Verified</span> : <span style={{ color: 'var(--text-muted)' }}>Not verified</span>}
          </p>
        </div>

        <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ marginBottom: 12 }}>📋 Account Info</h3>
          <table className="data-table">
            <tbody>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Voter ID</td><td style={{ fontFamily: 'monospace' }}>{user?.voterId || 'N/A'}</td></tr>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Role</td><td style={{ textTransform: 'capitalize' }}>{user?.role}</td></tr>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Email</td><td>{user?.email}</td></tr>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Constituency</td><td>{user?.constituency || 'Not set'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
