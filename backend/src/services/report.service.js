const Report = require('../models/Report');
const { resolveWeek } = require('../utils/isoWeek');

async function createDraft({ owner, project, weekStart: weekStartInput }) {
  const { weekStart, weekEnd, weekLabel } = resolveWeek(weekStartInput);

  const existing = await Report.findOne({ owner, weekLabel });
  if (existing) {
    const error = new Error('A report already exists for this week');
    error.status = 409;
    throw error;
  }

  const report = await Report.create({
    owner,
    project,
    weekStart,
    weekEnd,
    weekLabel,
    content: {},
    status: 'draft',
  });

  return report;
}

async function listReports({
  owner,
  project,
  status,
  weekStart,
  weekEnd,
  page = 1,
  limit = 20,
  sort = '-updatedAt',
}) {
  const filter = {};
  if (owner) filter.owner = owner;
  if (project) filter.project = project;
  if (status) filter.status = status;
  if (weekStart || weekEnd) {
    filter.weekStart = {};
    if (weekStart) filter.weekStart.$gte = new Date(weekStart);
    if (weekEnd) filter.weekStart.$lte = new Date(weekEnd);
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Report.find(filter)
      .select('-versions -reviewComments')
      .populate('owner', 'name email')
      .populate('project', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function updateContent(report, updates) {
  if (!['draft', 'needs_correction'].includes(report.status)) {
    const error = new Error('Report cannot be edited in its current status');
    error.status = 409;
    throw error;
  }

  if (updates.project) {
    report.project = updates.project;
  }
  if (updates.content) {
    report.content = updates.content;
  }

  await report.save();
  return report;
}

async function submitReport(report) {
  if (!['draft', 'needs_correction'].includes(report.status)) {
    const error = new Error('Report cannot be submitted in its current status');
    error.status = 409;
    throw error;
  }

  if (report.status === 'needs_correction') {
    report.currentVersionNumber += 1;
  }

  report.versions.push({
    versionNumber: report.currentVersionNumber,
    content: report.content,
    savedAt: new Date(),
  });

  report.status = 'submitted';
  report.submittedAt = new Date();

  await report.save();
  return report;
}

const ACTION_TO_STATUS = {
  approve: 'approved',
  request_changes: 'needs_correction',
};

const ACTION_TO_COMMENT_ACTION = {
  approve: 'approved',
  request_changes: 'requested_changes',
};

async function reviewReport(report, reviewerId, { action, comment }) {
  if (report.status !== 'submitted') {
    const error = new Error('Report is not awaiting review');
    error.status = 409;
    throw error;
  }

  const createdAt = new Date();
  const commentAction = ACTION_TO_COMMENT_ACTION[action];

  report.reviewComments.push({
    action: commentAction,
    comment,
    reviewer: reviewerId,
    targetVersionNumber: report.currentVersionNumber,
    createdAt,
  });

  report.latestComment = { action: commentAction, comment, reviewer: reviewerId, createdAt };
  report.status = ACTION_TO_STATUS[action];

  if (action === 'approve') {
    report.approvedAt = createdAt;
  }

  await report.save();
  return report;
}

module.exports = { createDraft, listReports, updateContent, submitReport, reviewReport };
