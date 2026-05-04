import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/admin/AdminLogin';
import VoterDashboard from './pages/voter/VoterDashboard';
import ElectionVoting from './pages/voter/ElectionVoting';
import VoteReceipt from './pages/voter/VoteReceipt';
import VoterHistory from './pages/voter/VoterHistory';
import GovAchievements from './pages/voter/GovAchievements';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Elections from './pages/admin/Elections';
import LedgerViewer from './pages/admin/LedgerViewer';
import Users from './pages/admin/Users';
import AuditLogs from './pages/admin/AuditLogs';
import Tickets from './pages/admin/Tickets';

// Protect routes component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : user.role === 'candidate' ? '/candidate' : '/voter'} />;
  }
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {/* Universal Dashboard Catch-all */}
          <Route path="/dashboard" element={
            user?.role === 'admin' ? <Navigate to="/admin/overview" replace /> :
            user?.role === 'candidate' ? <Navigate to="/candidate" replace /> :
            <Navigate to="/voter" replace />
          } />
          
          {/* Admin Specific Routes */}
          <Route path="/admin/overview" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/elections" element={<ProtectedRoute allowedRoles={['admin']}><Elections /></ProtectedRoute>} />
          <Route path="/admin/ledger" element={<ProtectedRoute allowedRoles={['admin']}><LedgerViewer /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>} />
          <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['admin']}><Tickets /></ProtectedRoute>} />

          {/* Voter Specific Routes */}
          <Route path="/voter" element={<ProtectedRoute allowedRoles={['voter']}><VoterDashboard /></ProtectedRoute>} />
          <Route path="/voter/history" element={<ProtectedRoute allowedRoles={['voter']}><VoterHistory /></ProtectedRoute>} />
          <Route path="/voter/gov-deeds" element={<ProtectedRoute allowedRoles={['voter']}><GovAchievements /></ProtectedRoute>} />
          <Route path="/voter/election/:id" element={<ProtectedRoute allowedRoles={['voter']}><ElectionVoting /></ProtectedRoute>} />
          <Route path="/voter/receipt/:id" element={<ProtectedRoute allowedRoles={['voter']}><VoteReceipt /></ProtectedRoute>} />
          
          <Route path="/candidate" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
