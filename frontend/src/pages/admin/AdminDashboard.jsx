import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setData(res.data);
      } catch (err) { 
        console.error(err);
        setError('Failed to load administrative data. Please check your network.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-bold animate-pulse">Initializing Admin Console...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 p-8 rounded-3xl text-center">
      <p className="text-red-600 font-bold mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">Retry Connection</button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Platform-wide statistics and activity monitoring.</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center shadow-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          System Live
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: data.stats.totalUsers, color: 'border-blue-500', icon: '👥' },
          { label: 'Total Votes', value: data.stats.totalVotes, color: 'border-green-500', icon: '🗳️' },
          { label: 'Active Elections', value: data.stats.activeElections, color: 'border-orange-500', icon: '🏛️' },
          { label: 'Open Tickets', value: data.stats.openTickets, color: 'border-red-500', icon: '🎫' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-3xl shadow-sm border-l-8 ${stat.color} hover:shadow-lg transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest">{stat.label}</h3>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <h3 className="font-black text-sm uppercase tracking-widest">Recent Audit Logs</h3>
            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded font-bold">LIVE FEED</span>
          </div>
          <ul className="divide-y divide-gray-50 flex-grow">
            {data.recentLogs.map((log, i) => (
              <li key={i} className="p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-start mb-1">
                   <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(log.time).toLocaleString()}</span>
                   <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                     log.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                   }`}>{log.severity}</span>
                </div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{log.action}</p>
                <p className="text-xs text-slate-500 mt-1">{log.details}</p>
              </li>
            ))}
            {data.recentLogs.length === 0 && (
              <li className="p-10 text-center text-gray-400 italic">No recent activity detected.</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 bg-primary text-white flex justify-between items-center">
            <h3 className="font-black text-sm uppercase tracking-widest">Active Elections</h3>
            <span className="text-[10px] bg-orange-700 px-2 py-1 rounded font-bold">MONITORING</span>
          </div>
          <ul className="divide-y divide-gray-50 flex-grow">
            {data.recentElections.map((el, i) => (
              <li key={i} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">{el.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{el.type}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    el.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{el.status}</span>
                  <p className="text-[9px] text-gray-400 mt-1 font-bold">{el.totalVotesCast || 0} Votes Cast</p>
                </div>
              </li>
            ))}
            {data.recentElections.length === 0 && (
              <li className="p-10 text-center text-gray-400 italic">No elections currently created.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
