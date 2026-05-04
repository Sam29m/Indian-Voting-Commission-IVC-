import { useState } from 'react';
import api from '../api/axios';
import './TwoFactorSetup.css';

export default function TwoFactorSetup({ onEnabled, onDisabled, isEnabled }) {
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState(isEnabled ? 'enabled' : 'idle'); // idle | setup | verify | enabled

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/2fa/setup');
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('setup');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/2fa/verify', { token: verifyCode });
      setSuccess('2FA enabled successfully!');
      setStep('enabled');
      onEnabled?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/2fa/disable');
      setStep('idle');
      setQrCode(null);
      setSecret('');
      setSuccess('2FA disabled');
      onDisabled?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerifyCode(val);
  };

  return (
    <div className="tfa-setup" id="tfa-setup">
      <div className="tfa-header">
        <div className="tfa-icon">🔐</div>
        <div>
          <h3>Google Authenticator</h3>
          <p className="tfa-desc">Time-based one-time passwords for secure login</p>
        </div>
        {step === 'enabled' && <span className="tfa-badge-on">Active</span>}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {step === 'idle' && (
        <button className="btn btn-primary" onClick={handleSetup} disabled={loading} id="btn-setup-2fa">
          {loading ? 'Setting up...' : 'Enable 2FA'}
        </button>
      )}

      {step === 'setup' && (
        <div className="tfa-qr-section animate-fade-in-scale">
          <p className="tfa-instruction">Scan this QR code with Google Authenticator:</p>
          {qrCode && <img src={qrCode} alt="2FA QR Code" className="tfa-qr-image" />}
          <div className="tfa-secret">
            <span className="tfa-secret-label">Manual key:</span>
            <code className="tfa-secret-code">{secret}</code>
          </div>
          <p className="tfa-instruction">Enter the 6-digit code from the app:</p>
          <div className="tfa-verify-row">
            <input
              type="text"
              className="form-input tfa-code-input"
              placeholder="000000"
              value={verifyCode}
              onChange={handleCodeChange}
              maxLength={6}
              autoFocus
              id="input-2fa-code"
            />
            <button
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={verifyCode.length !== 6 || loading}
              id="btn-verify-2fa"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </div>
      )}

      {step === 'enabled' && (
        <div className="tfa-enabled-section">
          <div className="tfa-status-active">
            <span className="tfa-check">✓</span>
            Two-factor authentication is active
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleDisable} disabled={loading} id="btn-disable-2fa">
            Disable 2FA
          </button>
        </div>
      )}
    </div>
  );
}
