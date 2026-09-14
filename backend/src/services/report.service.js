const Report = require('../models/Report');
const Project = require('../models/Project');
const { resolveWeek } = require('../utils/isoWeek');

async function assertProjectAccessible(projectId, userId) {
  const project = await Project.findById(projectId).select('members');
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }
  if (project.members.length > 0 && !project.members.some((memberId) => memberId.toString() === userId)) {
    const error = new Error('You are not assigned to this project');
    error.status = 403;
    throw error;
  }
}

async function createDraft({ owner, project, weekStart: weekStartInput, requesterRole }) {
  if (requesterRole !== 'manager') {
    await assertProjectAccessible(project, owner);
  }

  const { weekStart, weekEnd, weekLabel } = resolveWeek(weekStartInput);

  const existing = await Report.findOne({ owner, weekLabel, project });
  if (existing) {
    const error = new Error('A report already exists for this project and week');
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
  requesterId,
  requesterRole,
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

  // Drafts are private to their owner. A manager browsing other members' reports
  // should never see someone else's draft, only their own if they happen to own one.
  if (requesterRole === 'manager') {
    filter.$or = [{ status: { $ne: 'draft' } }, { owner: requesterId }];
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

async function updateContent(report, updates, requesterRole) {
  if (!['draft', 'needs_correction'].includes(report.status)) {
    const error = new Error('Report cannot be edited in its current status');
    error.status = 409;
    throw error;
  }

  const currentProjectId = (report.project._id || report.project).toString();
  if (updates.project && updates.project !== currentProjectId) {
    if (requesterRole !== 'manager') {
      const ownerId = (report.owner._id || report.owner).toString();
      await assertProjectAccessible(updates.project, ownerId);
    }
    const existing = await Report.findOne({
      owner: report.owner,
      weekLabel: report.weekLabel,
      project: updates.project,
    });
    if (existing) {
      const error = new Error('A report for this project and week already exists');
      error.status = 409;
      throw error;
    }
    report.project = updates.project;
  }
  if (updates.content) {
    report.content = updates.content;
  }

  await report.save();
  return report;
}

function validateReportComplete(report) {
  const missing = [];
  const hasCompletedTask = (report.content.tasksCompleted || []).some((task) => task.name && task.name.trim());
  const hasPlannedTask = (report.content.tasksPlannedNextWeek || []).some((task) => task.task && task.task.trim());

  if (!hasCompletedTask) {
    missing.push('at least one completed task');
  }
  if (!hasPlannedTask) {
    missing.push('at least one task planned for next week');
  }

  if (missing.length > 0) {
    const error = new Error(`Add ${missing.join(' and ')} before submitting`);
    error.status = 400;
    throw error;
  }
}

async function submitReport(report) {
  if (!['draft', 'needs_correction'].includes(report.status)) {
    const error = new Error('Report cannot be submitted in its current status');
    error.status = 409;
    throw error;
  }

  validateReportComplete(report);

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
