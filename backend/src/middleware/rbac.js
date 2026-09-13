const Report = require('../models/Report');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

async function loadReport(req, res, next) {
  const report = await Report.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('project', 'name');

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  req.report = report;
  next();
}

function requireReportOwnerOrManager(req, res, next) {
  const isOwner = req.report.owner._id.toString() === req.user.id;
  const isManager = req.user.role === 'manager';

  // Drafts are private to their owner, a manager may not view another
  // member's draft even though they can view everything once submitted.
  if (isOwner || (isManager && req.report.status !== 'draft')) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden' });
}

function requireReportOwner(req, res, next) {
  const isOwner = req.report.owner._id.toString() === req.user.id;

  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}

function requireSelfOrManager(req, res, next) {
  if (req.user.role === 'manager' || req.params.id === req.user.id) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

module.exports = {
  requireRole,
  loadReport,
  requireReportOwnerOrManager,
  requireReportOwner,
  requireSelfOrManager,
};
