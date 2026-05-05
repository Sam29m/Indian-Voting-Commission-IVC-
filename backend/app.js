const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { apiRateLimit } = require('./shared/middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(apiRateLimit);

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Services / Routes
app.use('/api/auth', require('./services/auth/authRoutes'));
app.use('/api/votes', require('./services/voting/votingRoutes'));

const adminRoutes = require('./services/admin/adminRoutes');
app.use('/api/elections', adminRoutes.electionRouter);
app.use('/api/candidates', adminRoutes.candidateRouter);
app.use('/api/dashboard', adminRoutes.dashboardRouter);
app.use('/api/users', adminRoutes.userRouter);

app.use('/api/audit', require('./services/audit/auditRoutes'));
app.use('/api/tickets', require('./services/tickets/ticketRoutes'));
app.use('/api/ai', require('./services/ai/aiRoutes'));
app.use('/api/bulletins', require('./services/admin/bulletinRoutes'));
// Keep the legacy mitra endpoint for frontend compatibility
app.use('/api/mitra', require('./services/ai/aiRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'IVC Backend Service Architecture', version: '2.0.0' });
});

module.exports = app;
