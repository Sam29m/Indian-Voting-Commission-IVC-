import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function VotingPage() {
  const { electionId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/elections/${electionId}`),
      api.get(`/votes/check/${electionId}`),
    ]).then(([elRes, voteRes]) => {
      setElection(elRes.data);
      setHasVoted(voteRes.data.hasVoted);
      setExistingReceipt(voteRes.data.receiptId);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [electionId]);

  const handleVote = async () => {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/votes/cast', { electionId, candidateId: selected });
      navigate(`/receipt/${data.receipt.receiptId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="page"><div className="container"><div className="spinner" /></div></div>;
  if (!election) return <div className="page"><div className="container"><p>Election not found</p></div></div>;

  if (hasVoted) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="receipt-card">
            <div className="receipt-icon">✅</div>
            <h2>You've Already Voted</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '12px 0' }}>
              Your vote in "{election.title}" has been recorded.
            </p>
            {existingReceipt && (
              <button onClick={() => navigate(`/receipt/${existingReceipt}`)} className="btn btn-primary" style={{ marginTop: 16 }}>
                View Receipt →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isActive = election.status === 'active' || (new Date() >= new Date(election.startDate) && new Date() <= new Date(election.endDate));

  if (!isActive) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '4rem' }}>🕐</span>
          <h2 style={{ marginTop: 16 }}>Election Not Active</h2>
          <p style={{ color: 'var(--text-secondary)' }}>This election is currently "{election.status}". Voting is only available during the active period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container voting-page">
        <div className="page-header animate-fade-in">
          <h1><span className="gradient-text">{t('castVote')}</span></h1>
          <p>{election.title}</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
            <span className="status-badge status-active">{election.status}</span>
            <span className="election-type">{election.type || 'general'}</span>
          </div>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {!confirmStep ? (
          <>
            <h3 style={{ marginBottom: 16 }}>Select Your {t('candidates')}:</h3>
            <div className="candidate-list stagger-children">
              {election.candidates?.map(c => (
                <div key={c._id} className={`candidate-option ${selected === c._id ? 'selected' : ''}`} onClick={() => setSelected(c._id)}>
                  <div className="candidate-symbol">{c.symbol || '🏛️'}</div>
                  <div className="candidate-info">
                    <h3>{c.name}</h3>
                    <p className="party">{c.party}</p>
                    {c.manifesto && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{c.manifesto}</p>}
                  </div>
                  <div className="radio-circle" />
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={!selected} onClick={() => setConfirmStep(true)}>
              {t('next')} →
            </button>
          </>
        ) : (
          <div className="animate-fade-in-scale" style={{ maxWidth: 500, margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>⚠️</span>
              <h2 style={{ margin: '16px 0 8px' }}>{t('voteConfirm')}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This action cannot be undone. Please verify your choice.</p>
              {(() => {
                const c = election.candidates.find(c => c._id === selected);
                return c ? (
                  <div style={{ background: 'var(--bg-input)', padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>{c.symbol || '🏛️'}</div>
                    <h3>{c.name}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{c.party}</p>
                  </div>
                ) : null;
              })()}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => setConfirmStep(false)}>← {t('back')}</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleVote} disabled={submitting}>
                  {submitting ? '🔄 Casting...' : `✅ ${t('voteConfirm')}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
