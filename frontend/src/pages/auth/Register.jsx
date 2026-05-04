import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', constituency: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="glass-panel p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Voter Registration</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full p-2 border rounded" />
        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full p-2 border rounded" />
        <input type="text" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded" />
        <input type="text" placeholder="Constituency" value={formData.constituency} onChange={e => setFormData({...formData, constituency: e.target.value})} className="w-full p-2 border rounded" />
        <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-orange-500 transition">Register</button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-500">
        Already registered? <Link to="/login" className="text-primary hover:underline">Login</Link>
      </div>
    </div>
  );
}
