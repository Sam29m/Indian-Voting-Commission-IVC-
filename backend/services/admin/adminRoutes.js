const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../../shared/middleware/auth');
const { requireRole } = require('../../shared/middleware/rbac');

const { getElections, getElection, createElection, updateElection } = require('./electionController');
const { getCandidates, getElectionCandidates, registerAsCandidate } = require('./candidateController');
const { voterDashboard, candidateDashboard, adminDashboard } = require('./dashboardController');

// Sub-routes for clarity

// --- Elections ---
const electionRouter = express.Router();
electionRouter.get('/', getElections);
electionRouter.get('/:id', getElection);
electionRouter.post('/', auth, adminOnly, createElection);
electionRouter.put('/:id', auth, adminOnly, updateElection);

// --- Candidates ---
const candidateRouter = express.Router();
candidateRouter.get('/', getCandidates);
candidateRouter.get('/election/:electionId', getElectionCandidates);
candidateRouter.post('/register', auth, registerAsCandidate);

// --- Dashboards ---
const dashboardRouter = express.Router();
dashboardRouter.get('/voter', auth, voterDashboard);
dashboardRouter.get('/candidate', auth, candidateDashboard);
dashboardRouter.get('/admin', auth, requireRole('admin'), adminDashboard);

const { getUsers } = require('./userController');

// --- Users ---
const userRouter = express.Router();
userRouter.get('/', auth, requireRole('admin'), getUsers);

module.exports = {
  electionRouter,
  candidateRouter,
  dashboardRouter,
  userRouter
};
