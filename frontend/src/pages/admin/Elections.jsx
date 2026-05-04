import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Elections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'general', constituency: 'National',
    startDate: '', endDate: '',
    candidates: [{ name: '', party: '', symbol: '🪷', manifesto: '' }]
  });

  const fetchElections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/elections');
      setElections(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Could not retrieve election data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleOpenModal = (election = null) => {
    if (election) {
      setEditingElection(election);
      setFormData({
        ...election,
        startDate: new Date(election.startDate).toISOString().slice(0, 16),
        endDate: new Date(election.endDate).toISOString().slice(0, 16),
      });
    } else {
      setEditingElection(null);
      setFormData({
        title: '', description: '', type: 'general', constituency: 'National',
        startDate: '', endDate: '',
        candidates: [{ name: '', party: '', symbol: '🪷', manifesto: '' }]
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingElection) {
        await api.put(`/elections/${editingElection._id}`, formData);
      } else {
        await api.post('/elections', formData);
      }
      setShowModal(false);
      fetchElections();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save election');
    }
  };

  const addCandidate = () => {
    setFormData({ ...formData, candidates: [...formData.candidates, { name: '', party: '', symbol: '', manifesto: '' }] });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Accessing Secure Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Election Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl my-8">
            <h3 className="text-2xl font-black text-slate-900 mb-6">
              {editingElection ? 'Configure Terminal' : 'Register New Terminal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Terminal Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 ring-orange-500" placeholder="e.g. 2026 Lok Sabha" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Segment</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <option value="general">General</option>
                    <option value="state">State</option>
                    <option value="local">Local</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl h-20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Start Session</label>
                  <input type="datetime-local" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">End Session</label>
                  <input type="datetime-local" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400">Candidate Registry</label>
                  <button type="button" onClick={addCandidate} className="text-[10px] font-black text-orange-600 uppercase">+ Add Candidate</button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-3 p-2 border border-dashed border-gray-200 rounded-2xl">
                  {formData.candidates.map((cand, idx) => (
                    <div key={idx} className="flex space-x-2">
                      <input placeholder="Name" value={cand.name} onChange={e => {
                        const newCands = [...formData.candidates];
                        newCands[idx].name = e.target.value;
                        setFormData({ ...formData, candidates: newCands });
                      }} required className="flex-1 p-2 bg-gray-50 rounded-lg text-sm border border-gray-100" />
                      <input placeholder="Party" value={cand.party} onChange={e => {
                        const newCands = [...formData.candidates];
                        newCands[idx].party = e.target.value;
                        setFormData({ ...formData, candidates: newCands });
                      }} required className="flex-1 p-2 bg-gray-50 rounded-lg text-sm border border-gray-100" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-100 text-slate-500 rounded-2xl font-black text-sm uppercase">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-black">Authorize Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Election Terminals</h1>
          <p className="text-slate-500 font-medium mt-1">Configure and monitor platform-wide voting sessions.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center space-x-2 active:scale-95"
        >
          <span>+</span>
          <span>New Terminal</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold text-center">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">Election Details</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">Voter Segment</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">Session Status</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest">Ledger Activity</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {elections.map((el) => (
              <tr key={el._id} className="group hover:bg-gray-50 transition-colors">
                <td className="p-6">
                  <p className="font-black text-slate-900 text-lg">{el.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {el._id.slice(-8)}</p>
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {el.type}
                  </span>
                  <p className="text-xs text-slate-500 mt-2 font-medium">{el.constituency}</p>
                </td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center w-fit ${el.status === 'active' ? 'bg-green-100 text-green-700' :
                    el.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${el.status === 'active' ? 'bg-green-500 animate-pulse' :
                      el.status === 'scheduled' ? 'bg-blue-500' : 'bg-slate-400'
                      }`}></span>
                    {el.status}
                  </span>
                </td>
                <td className="p-6">
                  <p className="text-xl font-black text-slate-900">{el.totalVotesCast || 0}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified Votes</p>
                </td>
                <td className="p-6 text-right">
                  <button
                    onClick={() => handleOpenModal(el)}
                    className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                  >
                    Configure
                  </button>
                </td>
              </tr>
            ))}
            {elections.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="p-20 text-center">
                  <div className="text-5xl mb-4 opacity-20">🗳️</div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Election Terminals Registered</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
