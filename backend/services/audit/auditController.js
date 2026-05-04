const AuditLog = require('../../shared/models/AuditLog');

// @desc    Get audit logs (admin only)
// @route   GET /api/audit
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, severity, page = 1, limit = 50 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (severity) query.severity = severity;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error: error.message });
  }
};

// @desc    Get audit log stats
// @route   GET /api/audit/stats
exports.getAuditStats = async (req, res) => {
  try {
    const total = await AuditLog.countDocuments();
    const criticalCount = await AuditLog.countDocuments({ severity: 'critical' });
    const warningCount = await AuditLog.countDocuments({ severity: 'warning' });
    
    // Recent actions (last 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await AuditLog.countDocuments({ createdAt: { $gte: last24h } });

    // Action breakdown
    const actionBreakdown = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      total,
      criticalCount,
      warningCount,
      recentCount,
      actionBreakdown: actionBreakdown.map(a => ({ action: a._id, count: a.count })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit stats', error: error.message });
  }
};

// @desc    Verify audit chain integrity
// @route   GET /api/audit/verify-chain
exports.verifyChain = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: 1 }).limit(1000);
    let valid = true;
    let brokenAt = null;

    for (let i = 1; i < logs.length; i++) {
      if (logs[i].previousHash !== logs[i - 1].hash) {
        valid = false;
        brokenAt = i;
        break;
      }
    }

    res.json({
      chainValid: valid,
      totalEntries: logs.length,
      brokenAt: brokenAt,
      message: valid ? 'Audit chain integrity verified ✓' : `Chain broken at entry ${brokenAt}`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Chain verification failed', error: error.message });
  }
};
