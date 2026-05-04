import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import MitraChat from '../components/MitraChat';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ivc-dark text-white flex flex-col">
        <div className="p-4 text-center text-xl font-bold border-b border-gray-700">
          <span className="text-primary">IVC</span> Portal
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {user?.role === 'voter' && (
            <>
              <Link to="/voter" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link>
              <Link to="/voter/history" className="block py-2 px-4 rounded hover:bg-gray-700">Vote History</Link>
              <Link to="/voter/gov-deeds" className="block py-2 px-4 rounded hover:bg-gray-700">Gov Deeds</Link>
            </>
          )}
          {user?.role === 'candidate' && (
            <>
              <Link to="/candidate" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/overview" className="block py-2 px-4 rounded hover:bg-gray-700">Overview</Link>
              <Link to="/admin/elections" className="block py-2 px-4 rounded hover:bg-gray-700">Elections</Link>
              <Link to="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-700">Users</Link>
              <Link to="/admin/audit" className="block py-2 px-4 rounded hover:bg-gray-700">Audit Logs</Link>
              <Link to="/admin/tickets" className="block py-2 px-4 rounded hover:bg-gray-700">Tickets</Link>
              <Link to="/admin/ledger" className="block py-2 px-4 rounded hover:bg-gray-700">Ledger Viewer</Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">
            Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Welcome, {user?.name}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 capitalize">{user?.role}</span>
          </div>
        </header>
        <main className="p-6 overflow-auto">
          <Outlet />
        </main>
        <MitraChat />
      </div>
    </div>
  );
}
