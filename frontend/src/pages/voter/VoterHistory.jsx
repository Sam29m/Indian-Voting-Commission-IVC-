import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function VoterHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/votes/history');
        setHistory(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900">Your Vote History</h1>
        <Link to="/voter" className="text-sm font-bold text-orange-600 hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-6 text-xs font-black uppercase tracking-widest">Election</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest">Candidate</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest">Date</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest">Status</th>
              <th className="p-6 text-xs font-black uppercase tracking-widest">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {history.map((item) => (
              <tr key={item.receiptId} className="hover:bg-gray-50 transition-colors">
                <td className="p-6">
                  <p className="font-bold text-slate-900">{item.election}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.electionType}</p>
                </td>
                <td className="p-6">
                  <p className="font-bold text-slate-700">{item.candidateName}</p>
                  <p className="text-xs text-slate-400">{item.candidateParty}</p>
                </td>
                <td className="p-6 text-sm text-slate-500">
                  {new Date(item.timestamp).toLocaleDateString()}
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">Recorded</span>
                </td>
                <td className="p-6">
                  <Link to={`/voter/receipt/${item.receiptId}`} className="text-orange-600 font-black text-xs hover:underline uppercase tracking-widest">
                    View Receipt
                  </Link>
                </td>
              </tr>
            ))}
            {history.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="p-20 text-center">
                  <div className="text-4xl mb-4 opacity-20">📜</div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No voting history found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
