import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@ivc.gov.in');
  const [password, setPassword] = useState('admin123');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setUserId(res.data.userId);
      setStep(2); // OTP step
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      const res = await api.post('/auth/complete-login', { userId });
      
      // Strict Role Validation
      if (res.data.user.role !== 'admin') {
        setError('Access Denied: This portal is strictly for administrators.');
        return;
      }
      
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border-t-4 border-red-600 p-8 w-full max-w-md shadow-2xl rounded-b-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">SECURE ADMIN PORTAL</h2>
        <p className="text-slate-400 text-center text-sm mb-6">Indian Voting Commission</p>
        
        {error && <div className="bg-red-900 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Administrator ID (Email)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Security Passphrase</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-red-500" />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-bold tracking-wider">AUTHENTICATE</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Secure OTP Code</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-center text-white text-lg tracking-widest focus:outline-none focus:border-red-500" maxLength={6} />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-bold tracking-wider">VERIFY IDENTITY</button>
          </form>
        )}
      </div>
    </div>
  );
}
