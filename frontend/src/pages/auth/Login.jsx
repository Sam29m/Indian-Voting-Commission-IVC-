import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import AadhaarAuth from '../../components/auth/AadhaarAuth';
import FaceAuth from '../../components/auth/FaceAuth';

export default function Login() {
  const [email, setEmail] = useState('priya@example.com');
  const [password, setPassword] = useState('voter123');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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
      setStep(3); // Aadhaar step
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  const handleAadhaarVerified = async (aadhaarNumber) => {
    setError('');
    try {
      await api.post('/auth/verify-aadhaar', { userId, aadhaarNumber });
      setStep(4); // Face step
    } catch (err) {
      setError(err.response?.data?.message || 'Aadhaar verification failed');
    }
  };

  const handleFaceVerified = async (descriptor) => {
    setLoading(true);
    try {
      // First, check if face auth is enabled/registered for this user
      let faceRes;
      try {
        faceRes = await api.post('/auth/verify-face', { userId, descriptor });
      } catch (err) {
        // If it fails with 400, it might be because face is not yet registered
        if (err.response?.status === 400) {
          console.log('Face not registered, registering now...');
          await api.post('/auth/face/register', { userId, descriptor });
          faceRes = { data: { verified: true } };
        } else {
          throw err;
        }
      }
      
      if (faceRes.data.verified) {
        const res = await api.post('/auth/complete-login', { userId });
        
        if (res.data.user.role === 'admin') {
          setError('Administrators must use the Secure Admin Portal.');
          setLoading(false);
          return;
        }
        
        login(res.data.user, res.data.token);
        navigate(res.data.user.role === 'candidate' ? '/candidate' : '/voter');
      } else {
        setError('Face mismatch. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Face verification failed. Please ensure you are in a well-lit area.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Voter Portal</h2>
        <div className="flex justify-center space-x-2 mt-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 w-8 rounded-full ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} />
          ))}
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-2">
          Step {step}: {step === 1 ? 'Credentials' : step === 2 ? 'OTP' : step === 3 ? 'Aadhaar' : 'Face'}
        </p>
      </div>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-orange-500 transition shadow-lg">Login</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-center">Enter 6-digit OTP</label>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required className="w-full p-2 border rounded text-center text-xl font-bold tracking-widest" maxLength={6} />
          </div>
          <button type="submit" className="w-full bg-secondary text-white py-2 rounded hover:bg-green-700 transition shadow-lg">Verify OTP</button>
        </form>
      )}

      {step === 3 && (
        <AadhaarAuth onVerified={handleAadhaarVerified} error={error} />
      )}

      {step === 4 && (
        <FaceAuth onVerified={handleFaceVerified} userId={userId} />
      )}
      
      {step === 1 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
        </div>
      )}
    </div>
  );
}
