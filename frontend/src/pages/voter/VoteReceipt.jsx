import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function VoteReceipt() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await api.get(`/votes/receipt/${id}`);
        setReceipt(res.data);
      } catch (err) {
        setError('Failed to load cryptographic receipt. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen font-bold italic text-gray-500">GENERATING CRYPTOGRAPHIC PROOF...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold bg-red-50 rounded-lg m-6 border border-red-200">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <div className="bg-green-600 text-white p-10 rounded-3xl shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="w-20 h-20 bg-white text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg">
          ✓
        </div>
        <h1 className="text-4xl font-black mb-2">Vote Cast Successfully</h1>
        <p className="text-green-100 font-medium">Your voice has been securely recorded in the IVC ledger.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-dashed border-gray-200 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-100 px-4 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Cryptographic Proof of Vote
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-tighter">Election</span>
            <span className="font-extrabold text-gray-900">{receipt.election || 'General Election'}</span>
          </div>

          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-tighter">Voter Reference</span>
            <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">{receipt.voterId || '********'}</span>
          </div>

          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-tighter">Timestamp</span>
            <span className="font-bold text-gray-600">{new Date(receipt.createdAt).toLocaleString()}</span>
          </div>

          <div className="space-y-2">
            <span className="text-gray-400 font-bold text-xs uppercase tracking-tighter block">Tamper-Evident Ledger Hash (SHA-256)</span>
            <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-xs break-all leading-relaxed shadow-inner border border-slate-800">
              {receipt.voteHash}
            </div>
            <p className="text-[10px] text-gray-400 italic">
              This hash represents your vote's unique place in the cryptographic chain. Any modification to the data would invalidate this hash.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Link 
          to="/voter" 
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-center hover:bg-black shadow-lg transition-all"
        >
          Return to Dashboard
        </Link>
        <button 
          onClick={() => window.print()}
          className="w-full py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
        >
          Download PDF Receipt
        </button>
      </div>
    </div>
  );
}
