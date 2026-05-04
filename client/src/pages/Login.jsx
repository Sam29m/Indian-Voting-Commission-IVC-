import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function Login() {
  const { login, completeLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=creds, 2=OTP, 3=Aadhaar, 4=Face
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [userId, setUserId] = useState(null);
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaData, setMfaData] = useState(null);

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.requiresMFA) {
        setMfaData(data);
        setUserId(data.userId);
        setStep(2);
      } else {
        // No MFA, proceed to OTP step anyway for Triple-Lock
        setUserId(data.user._id);
        setStep(2);
        // Send OTP
        const otpRes = await api.post('/auth/send-otp', { email });
        setDemoOtp(otpRes.data.demo_otp || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setError('');
    try {
      const { data } = await api.post('/auth/send-otp', { email });
      setDemoOtp(data.demo_otp || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
    setLoading(false);
  };

  const handleVerifyAadhaar = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-aadhaar', { userId, aadhaarNumber: aadhaar });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Aadhaar verification failed');
    }
    setLoading(false);
  };

  const handleFaceVerify = async () => {
    setError('');
    setLoading(true);
    try {
      // Simulated face verification for demo
      await new Promise(r => setTimeout(r, 1500));
      // Complete login
      await completeLogin(userId);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Face verification failed');
    }
    setLoading(false);
  };

  const skipToComplete = async () => {
    try {
      await completeLogin(userId);
      navigate('/');
    } catch (err) {
      setError('Login completion failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="gradient-text">{t('loginTitle')}</h1>
        <p className="auth-subtitle">{t('tripleLock')}</p>

        <div className="steps-indicator">
          {[1, 2, 3, 4].map((s, i) => (
            <span key={s}>
              <span className={`step-dot ${step === s ? 'active' : step > s ? 'completed' : 'pending'}`}>
                {step > s ? '✓' : s}
              </span>
              {i < 3 && <span className={`step-line ${step > s ? 'completed' : ''}`} />}
            </span>
          ))}
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* Step 1: Credentials */}
        {step === 1 && (
          <form onSubmit={handleCredentials}>
            <div className="form-group">
              <label className="form-label">{t('email')}</label>
              <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('password')}</label>
              <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '...' : t('next')} →
            </button>
            <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Don't have an account? <Link to="/register">{t('register')}</Link>
            </p>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: '3rem' }}>📱</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{t('enterOtp')}</p>
              {demoOtp && (
                <div className="alert alert-info" style={{ marginTop: 12 }}>
                  🔑 Demo OTP: <strong>{demoOtp}</strong>
                </div>
              )}
            </div>
            <div className="form-group">
              <input type="text" className="form-input" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' }} required />
            </div>
            {!demoOtp && (
              <button type="button" onClick={handleSendOtp} className="btn btn-secondary btn-sm" style={{ width: '100%', marginBottom: 12 }}>
                {t('sendOtp')}
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '...' : t('verifyOtp')} →
            </button>
          </form>
        )}

        {/* Step 3: Aadhaar */}
        {step === 3 && (
          <form onSubmit={handleVerifyAadhaar}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: '3rem' }}>🪪</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{t('aadhaarNumber')}</p>
            </div>
            <div className="form-group">
              <input type="text" className="form-input" value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))} placeholder="XXXX XXXX XXXX" maxLength={12} style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.2em' }} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading || aadhaar.length !== 12}>
              {loading ? '...' : t('verifyAadhaar')} →
            </button>
          </form>
        )}

        {/* Step 4: Face */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: 16 }}>👤</span>
            <h3 style={{ marginBottom: 8 }}>{t('faceVerify')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9375rem' }}>
              Position your face in the camera frame
            </p>
            <div style={{ width: 200, height: 200, margin: '0 auto 24px', borderRadius: '50%', border: '3px solid var(--accent-primary)', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', animation: 'glow-pulse 2s infinite' }}>
              😊
            </div>
            <button onClick={handleFaceVerify} className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '🔄 Verifying...' : '✅ Verify & Login'}
            </button>
            <button onClick={skipToComplete} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 12 }}>
              Skip (Demo Mode)
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔒 Secured by Indian Voting Commission
          </p>
        </div>
      </div>
    </div>
  );
}
