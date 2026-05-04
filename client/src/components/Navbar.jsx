import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout, isAdmin, isCandidate } = useAuth();
  const { lang, changeLang, t } = useLanguage();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isCandidate) return '/candidate/dashboard';
    return '/voter/dashboard';
  };

  return (
    <>
      <div className="tricolor-stripe" />
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🗳️</span>
            <span className="brand-text">
              IVC
              <span className="brand-sub">{t('indianVotingCommission')}</span>
            </span>
          </Link>
          <div className="navbar-links">
            <Link to="/" className={isActive('/')}>{t('home')}</Link>
            {user && (
              <>
                <Link to={getDashboardLink()} className={isActive(getDashboardLink())}>{t('dashboard')}</Link>
                <Link to="/elections" className={isActive('/elections')}>{t('elections')}</Link>
                <Link to="/mitra" className={isActive('/mitra')}>🤖 {t('mitra')}</Link>
                {isAdmin && (
                  <Link to="/admin/create" className={isActive('/admin/create')}>+ Create</Link>
                )}
              </>
            )}
            <select className="lang-select" value={lang} onChange={e => changeLang(e.target.value)}>
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
            {user ? (
              <button onClick={logout} className="btn btn-sm btn-secondary">
                {t('logout')}
              </button>
            ) : (
              <Link to="/login" className={`btn btn-sm btn-primary ${isActive('/login')}`}>{t('login')}</Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
