import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ElectionVoting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voting, setVoting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await api.get(`/elections/${id}`);
        setElection(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load election details');
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, [id]);

  const handleVote = async () => {
    if (!selectedCandidate) return;
    setVoting(true);
    try {
      const res = await api.post('/votes/cast', {
        electionId: id,
        candidateId: selectedCandidate._id
      });
      // res.data contains the receipt object with receiptId
      navigate(`/voter/receipt/${res.data.receipt.receiptId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cast vote. Have you already voted in this election?');
      setVoting(false);
      setShowConfirm(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen font-bold text-gray-500 italic">SECURE CONNECTION INITIALIZING...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold bg-red-50 rounded-lg m-6 border border-red-200">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-xl border-b-4 border-orange-600">
        <h1 className="text-3xl font-extrabold mb-2">{election.title}</h1>
        <p className="text-slate-300 mb-4 italic">Official IVC Voting Terminal</p>
        <div className="flex flex-wrap gap-3">
          <span className="bg-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{election.type}</span>
          <span className="bg-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-slate-600">{election.constituency}</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-3 text-lg font-black italic">!</span>
          Select Your Candidate
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {election.candidates.map(candidate => (
            <div 
              key={candidate._id}
              onClick={() => !voting && setSelectedCandidate(candidate)}
              className={`p-5 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between group
                ${selectedCandidate?._id === candidate._id 
                  ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-200' 
                  : 'border-gray-100 hover:border-orange-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center space-x-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-inner
                  ${selectedCandidate?._id === candidate._id ? 'bg-white' : 'bg-gray-100'}`}>
                  {candidate.symbol || '👤'}
                </div>
                <div>
                  <p className="font-extrabold text-xl text-gray-900 group-hover:text-orange-600 transition-colors">{candidate.name}</p>
                  <p className="text-gray-500 font-medium">{candidate.party}</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${selectedCandidate?._id === candidate._id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                {selectedCandidate?._id === candidate._id && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-6 flex justify-center">
        <button 
          disabled={!selectedCandidate || voting}
          onClick={() => setShowConfirm(true)}
          className={`px-12 py-4 rounded-full font-black text-xl shadow-2xl transition-all transform active:scale-95
            ${!selectedCandidate || voting 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-orange-600 text-white hover:bg-orange-700 hover:-translate-y-1 hover:shadow-orange-200'}`}
        >
          {voting ? 'ENCRYPTING VOTE...' : 'CAST SECURE VOTE'}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100 border-t-8 border-orange-600">
            <h3 className="text-2xl font-black text-gray-900 mb-4">Confirm Your Vote</h3>
            <p className="text-gray-600 mb-6">
              You are about to cast your vote for <span className="font-black text-gray-900">{selectedCandidate.name}</span> representing <span className="font-bold">{selectedCandidate.party}</span>.
              <br/><br/>
              <span className="text-red-600 font-bold italic">Note: This action is permanent and cannot be reversed.</span>
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={handleVote}
                className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
              >
                Yes, Cast Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
