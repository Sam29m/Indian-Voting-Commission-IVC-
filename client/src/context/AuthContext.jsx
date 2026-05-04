import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ivc_token');
    const savedUser = localStorage.getItem('ivc_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requiresMFA) return data;
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('ivc_token', data.token);
    localStorage.setItem('ivc_user', JSON.stringify(data.user));
    return data;
  };

  const completeLogin = async (userId) => {
    const { data } = await api.post('/auth/complete-login', { userId });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('ivc_token', data.token);
    localStorage.setItem('ivc_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('ivc_token', data.token);
    localStorage.setItem('ivc_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ivc_token');
    localStorage.removeItem('ivc_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('ivc_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout, completeLogin, updateUser,
      isAdmin: user?.role === 'admin',
      isCandidate: user?.role === 'candidate',
      isVoter: user?.role === 'voter',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
