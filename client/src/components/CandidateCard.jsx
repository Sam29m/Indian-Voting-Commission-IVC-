import { useState } from 'react';
import './CandidateCard.css';

export default function CandidateCard({ candidate, index, totalVotes, onVote, hasVoted, isActive, voting }) {
  const [justVoted, setJustVoted] = useState(false);
  const votePercent = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0;

  const handleVote = async () => {
    if (hasVoted || !isActive || voting) return;
    setJustVoted(true);
    await onVote(candidate.id);
  };

  const colors = [
    'var(--accent-primary)',
    'var(--accent-secondary)',
    'var(--success)',
    'var(--warning)',
    '#ec4899',
    'var(--info)',
  ];
  const color = colors[index % colors.length];

  return (
    <div className={`candidate-card glass-card ${justVoted ? 'candidate-voted' : ''}`} id={`candidate-${candidate.id}`}>
      <div className="candidate-info">
        <div className="candidate-avatar" style={{ background: color }}>
          {candidate.name.charAt(0)}
        </div>
        <div className="candidate-details">
          <h4 className="candidate-name">{candidate.name}</h4>
          {candidate.party && <span className="candidate-party">{candidate.party}</span>}
        </div>
      </div>

      <div className="candidate-stats">
        <div className="vote-bar-container">
          <div
            className="vote-bar"
            style={{ width: `${votePercent}%`, background: color }}
          />
        </div>
        <div className="vote-numbers">
          <span className="vote-count">{Number(candidate.voteCount)} votes</span>
          <span className="vote-percent">{votePercent}%</span>
        </div>
      </div>

      {isActive && !hasVoted && (
        <button
          className="btn btn-primary btn-vote"
          onClick={handleVote}
          disabled={voting}
          id={`btn-vote-${candidate.id}`}
        >
          {voting ? (
            <>
              <span className="spinner-sm" />
              Casting Vote...
            </>
          ) : (
            <>✓ Vote</>
          )}
        </button>
      )}

      {hasVoted && justVoted && (
        <div className="vote-confirmed">
          <span className="vote-check">✓</span> Vote Confirmed
        </div>
      )}
    </div>
  );
}
