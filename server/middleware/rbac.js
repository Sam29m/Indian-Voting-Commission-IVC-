// Role-Based Access Control middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }
    next();
  };
};

const isAdmin = requireRole('admin');
const isVoter = requireRole('voter');
const isCandidate = requireRole('candidate');
const isVoterOrCandidate = requireRole('voter', 'candidate');
const isAdminOrCandidate = requireRole('admin', 'candidate');

module.exports = { requireRole, isAdmin, isVoter, isCandidate, isVoterOrCandidate, isAdminOrCandidate };
