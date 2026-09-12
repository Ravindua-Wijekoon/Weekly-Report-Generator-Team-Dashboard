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

module.exports = { createDraft, listReports, updateContent };
