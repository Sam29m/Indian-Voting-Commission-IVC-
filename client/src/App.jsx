import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ElectionDetail from './pages/ElectionDetail';
import CandidateListing from './pages/CandidateListing';
import VotingPage from './pages/VotingPage';
import VotingSlip from './pages/VotingSlip';
import VoterDashboard from './pages/VoterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateElection from './pages/CreateElection';
import MitraChat from './pages/MitraChat';
import Support from './pages/Support';
import Security from './pages/Security';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/elections" element={<CandidateListing />} />
        <Route path="/election/:id" element={<ElectionDetail />} />

        {/* Voting */}
        <Route path="/vote/:electionId" element={
          <ProtectedRoute><VotingPage /></ProtectedRoute>
        } />
        <Route path="/receipt/:receiptId" element={<VotingSlip />} />

        {/* Dashboards */}
        <Route path="/voter/dashboard" element={
          <ProtectedRoute><VoterDashboard /></ProtectedRoute>
        } />
        <Route path="/candidate/dashboard" element={
          <ProtectedRoute roles={['candidate', 'admin']}><CandidateDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/create" element={
          <ProtectedRoute adminOnly><CreateElection /></ProtectedRoute>
        } />

        {/* Features */}
        <Route path="/mitra" element={<MitraChat />} />
        <Route path="/support" element={
          <ProtectedRoute><Support /></ProtectedRoute>
        } />
        <Route path="/settings/security" element={
          <ProtectedRoute><Security /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}
