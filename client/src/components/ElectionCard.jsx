import { Link } from 'react-router-dom';
import './ElectionCard.css';

export default function ElectionCard({ election }) {
  const { _id, title, description, candidates, startDate, endDate, status, contractAddress } = election;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(endDate);
    const start = new Date(startDate);

    if (status === 'completed') return 'Ended';
    if (status === 'upcoming') {
      const diff = start - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `Starts in ${days}d ${hours}h`;
    }
    const diff = end - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };

  return (
    <Link to={`/election/${_id}`} className="election-card glass-card" id={`election-${_id}`}>
      <div className="election-card-header">
        <span className={`status-badge status-${status}`}>{status}</span>
        {contractAddress && <span className="chain-badge">⛓️ On-chain</span>}
      </div>

      <h3 className="election-card-title">{title}</h3>
      <p className="election-card-desc">{description}</p>

      <div className="election-card-meta">
        <div className="election-meta-item">
          <span className="meta-label">Candidates</span>
          <span className="meta-value">{candidates?.length || 0}</span>
        </div>
        <div className="election-meta-item">
          <span className="meta-label">Time</span>
          <span className="meta-value meta-time">{getTimeRemaining()}</span>
        </div>
      </div>

      <div className="election-card-dates">
        <span>{formatDate(startDate)}</span>
        <span className="date-separator">→</span>
        <span>{formatDate(endDate)}</span>
      </div>
    </Link>
  );
}
