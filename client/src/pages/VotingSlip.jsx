import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VotingSlip() {
  const { receiptId } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/votes/receipt/${receiptId}`)
      .then(r => { setReceipt(r.data); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || 'Receipt not found'); setLoading(false); });
  }, [receiptId]);

  if (loading) return <div className="page"><div className="container"><div className="spinner" /></div></div>;
  if (error) return <div className="page"><div className="container"><div className="alert alert-error">{error}</div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="receipt-card animate-fade-in-scale">
          <div className="receipt-icon">🗳️</div>
          <h2 style={{ marginBottom: 4 }}>Vote Recorded Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Your vote has been securely recorded</p>

          <div className="receipt-id">{receipt.receiptId}</div>

          <div className="receipt-details">
            <div className="receipt-row"><span className="label">Voter</span><span>{receipt.voterName}</span></div>
            <div className="receipt-row"><span className="label">Voter ID</span><span style={{ fontFamily: 'monospace' }}>{receipt.voterId}</span></div>
            <div className="receipt-row"><span className="label">Election</span><span>{receipt.election}</span></div>
            <div className="receipt-row"><span className="label">Type</span><span style={{ textTransform: 'capitalize' }}>{receipt.electionType}</span></div>
            <div className="receipt-row"><span className="label">Candidate</span><span>{receipt.candidateName}</span></div>
            <div className="receipt-row"><span className="label">Party</span><span>{receipt.candidateParty}</span></div>
            <div className="receipt-row"><span className="label">Timestamp</span><span>{new Date(receipt.timestamp).toLocaleString()}</span></div>
            <div className="receipt-row" style={{ borderBottom: 'none' }}>
              <span className="label">Hash</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', maxWidth: 200 }}>{receipt.voteHash?.substring(0, 16)}...</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 20, padding: 12, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
            <span>✅</span> Verified & Tamper-Proof
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">🏠 Home</Link>
            <Link to="/voter/dashboard" className="btn btn-secondary">📊 Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
