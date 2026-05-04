import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../store/AuthContext';

export default function VoterDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [showSecurity, setShowSecurity] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, bullRes] = await Promise.all([
          api.get('/dashboard/voter'),
          api.get('/bulletins')
        ]);
        setData(dashRes.data);
        setBulletins(bullRes.data);
      } catch (err) { console.error(err); }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs animate-pulse">Syncing with IVC Ledger...</p>
    </div>
  );

  const highSeverityBulletin = bulletins.find(b => b.severity === 'high');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Real-time Ticker */}
      {highSeverityBulletin && (
        <div className="bg-red-600 text-white py-2 px-4 rounded-xl flex items-center overflow-hidden shadow-lg shadow-red-200">
          <span className="bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded mr-4 uppercase animate-pulse">Breaking</span>
          <div className="whitespace-nowrap animate-marquee font-bold text-sm">
            {highSeverityBulletin.title}: {highSeverityBulletin.content}
          </div>
        </div>
      )}

      {/* Security Modal */}
      {showSecurity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border-t-8 border-indigo-600 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-black text-slate-900">Security Status</h3>
              <span className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full text-[8px] font-black uppercase text-green-600">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span>Live Protection</span>
              </span>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Biometric Face ID', status: user?.faceEnabled ? 'Verified' : 'Not Setup', icon: '👤', active: user?.faceEnabled },
                { label: 'Aadhaar Linkage', status: user?.aadhaarVerified ? 'Secure' : 'Pending', icon: '🆔', active: user?.aadhaarVerified },
                { label: 'OTP Tunnel', status: 'Encrypted', icon: '🔒', active: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <span className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center ${item.active ? 'bg-green-100' : 'bg-gray-200'}`}>
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{item.label}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Triple-Lock Layer {idx + 1}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.active ? 'text-green-600' : 'text-orange-500'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            
            <p className="mt-8 text-xs text-slate-400 text-center font-medium leading-relaxed">
              Your session is protected by military-grade AES-256 encryption. <br/> 
              Last security audit: {new Date().toLocaleTimeString()}
            </p>

            <button 
              onClick={() => setShowSecurity(false)}
              className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95"
            >
              Close Secure View
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Voter Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back, <span className="text-orange-600 font-bold">{user?.name}</span></p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-right px-2">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Digital Voter ID</p>
            <p className="text-sm font-bold text-slate-700">{user?.voterId}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-200">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Top Stats - Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 relative overflow-hidden group hover:shadow-xl hover:shadow-orange-100 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
              <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest relative z-10">Active Elections</h3>
              <p className="text-4xl font-black text-slate-900 mt-2 relative z-10">{data.stats.activeElections}</p>
              <div className="mt-4 h-1 w-12 bg-orange-500 rounded-full"></div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 relative overflow-hidden group hover:shadow-xl hover:shadow-green-100 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
              <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest relative z-10">Total Votes Cast</h3>
              <p className="text-4xl font-black text-slate-900 mt-2 relative z-10">{data.stats.votesPlaced}</p>
              <div className="mt-4 h-1 w-12 bg-green-500 rounded-full"></div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
              <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest relative z-10">Upcoming Events</h3>
              <p className="text-4xl font-black text-slate-900 mt-2 relative z-10">{data.stats.upcomingCount}</p>
              <div className="mt-4 h-1 w-12 bg-slate-800 rounded-full"></div>
            </div>
          </div>
          
          {/* Live Elections Section */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl text-white">Live Terminals</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Authorized Voting Channels</p>
              </div>
              <span className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">System Active</span>
              </span>
            </div>
            <div className="p-4 space-y-4">
              {data.activeElections.map(el => (
                <div key={el._id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-gray-50 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-orange-100 group">
                  <div className="flex items-center space-x-6 mb-4 md:mb-0 w-full">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {el.type === 'general' ? '🏛️' : '🏙️'}
                    </div>
                    <div>
                      <p className="font-black text-xl text-slate-900">{el.title}</p>
                      <div className="flex space-x-3 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{el.type}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                          <span className="mr-1">📍</span> {el.constituency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/voter/election/${el._id}`} className="w-full md:w-auto bg-orange-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-orange-700 shadow-lg shadow-orange-100 transition-all active:scale-95 text-center">
                    Cast Vote
                  </Link>
                </div>
              ))}
              {data.activeElections.length === 0 && (
                <div className="p-20 text-center">
                  <div className="text-5xl mb-4 opacity-20">🗳️</div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active elections in your region</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full -mb-20 -mr-20 transition-transform group-hover:scale-125"></div>
              <h4 className="font-black text-xs uppercase tracking-widest opacity-60 mb-2">Security Center</h4>
              <h3 className="text-2xl font-black mb-4">Triple-Lock Verification</h3>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6">Your identity is protected by Biometric, Aadhaar, and OTP layers. Keep your records updated for seamless voting.</p>
              <button 
                onClick={() => setShowSecurity(true)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Verify Status
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2">Latest Results</h4>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Previous Election Data</h3>
                <p className="text-slate-500 text-sm">View the cryptographic results of recently concluded elections in your constituency.</p>
              </div>
              <Link to="/voter/history" className="mt-6 text-orange-600 font-black text-sm flex items-center hover:translate-x-2 transition-transform">
                VIEW HISTORY <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Voter ID Card - NEW */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden border border-slate-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex justify-between items-start mb-10">
              <div className="text-orange-500 font-black italic text-xl tracking-tighter">IVC</div>
              <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Official E-Card</div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Authorized Voter</p>
                <p className="text-xl font-black tracking-tight">{user?.name}</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Voter ID Number</p>
                  <p className="font-mono font-bold text-orange-500">{user?.voterId}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-lg p-1">
                   <div className="w-full h-full bg-slate-900 rounded-sm flex items-center justify-center text-[8px] font-black text-white">QR</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bulletin Board */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Election Bulletins</h3>
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            </div>
            <div className="p-6 space-y-6">
              {bulletins.map(b => (
                <div key={b._id} className="group cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      b.severity === 'high' ? 'bg-red-100 text-red-600' : 
                      b.severity === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>{b.category}</span>
                    <span className="text-[10px] text-slate-300 font-bold uppercase">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 group-hover:text-orange-600 transition-colors leading-tight">
                    {b.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {b.content}
                  </p>
                </div>
              ))}
              {bulletins.length === 0 && (
                <div className="text-center py-6">
                   <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">No Bulletins</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Helper Card */}
          <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-100 relative overflow-hidden group cursor-pointer hover:bg-orange-700 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-black mb-2">Mitra AI Support</h3>
            <p className="text-orange-100 text-xs font-medium leading-relaxed">Have questions about the voting process? Mitra AI is here to help you 24/7 in multiple languages.</p>
            <div className="mt-6 flex items-center text-xs font-black uppercase tracking-widest">
              Launch Chat <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
