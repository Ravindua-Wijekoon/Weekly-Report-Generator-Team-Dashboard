const User = require('../models/User');
const Report = require('../models/Report');
const { resolveWeek } = require('../utils/isoWeek');

async function getSummary(weekInput) {
  const { weekStart, weekEnd } = resolveWeek(weekInput);

  const reports = await Report.find({ weekStart }).select('status content.blockers owner');
  const members = await User.find({ role: 'member', isActive: true }).select('_id');
  const memberIds = members.map((member) => member._id.toString());

  const submittedOwnerIds = new Set(
    reports
      .filter((report) => ['submitted', 'needs_correction', 'approved'].includes(report.status))
      .map((report) => report.owner.toString())
  );

  let submitted = 0;
  let pending = 0;
  let late = 0;
  const isPastWeek = weekEnd < new Date();

  for (const memberId of memberIds) {
    if (submittedOwnerIds.has(memberId)) {
      submitted += 1;
    } else if (isPastWeek) {
      late += 1;
    } else {
      pending += 1;
    }
  }

  const needsCorrectionCount = reports.filter((report) => report.status === 'needs_correction').length;
  const openBlockersCount = reports.reduce((sum, report) => sum + (report.content?.blockers?.length || 0), 0);

  return {
    weekStart,
    weekEnd,
    totalSubmitted: submitted,
    compliance: { submitted, pending, late, total: memberIds.length },
    needsCorrectionCount,
    openBlockersCount,
  };
}

async function getTrend({ weeks = 8, project, owner } = {}) {
  const now = new Date();
  const result = [];

  for (let i = weeks - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - i * 7);
    const { weekStart, weekLabel } = resolveWeek(date);

    const filter = { weekStart };
    if (project) filter.project = project;
    if (owner) filter.owner = owner;

    const reports = await Report.find(filter).select('content.tasksCompleted');
    const tasksCompleted = reports.reduce(
      (sum, report) => sum + (report.content?.tasksCompleted?.length || 0),
      0
    );

    result.push({ weekLabel, weekStart, tasksCompleted });
  }

  return result;
}

async function getStatusByMember(weekInput) {
  const { weekStart } = resolveWeek(weekInput);

  const members = await User.find({ role: 'member', isActive: true }).select('name email');
  const reports = await Report.find({ weekStart })
    .select('owner status project')
    .populate('project', 'name');

  const reportsByOwner = new Map();
  for (const report of reports) {
    const key = report.owner.toString();
    if (!reportsByOwner.has(key)) {
      reportsByOwner.set(key, []);
    }
    reportsByOwner.get(key).push({
      reportId: report._id,
      status: report.status,
      project: report.project,
    });
  }

  return members.map((member) => ({
    userId: member._id,
    name: member.name,
    email: member.email,
    reports: reportsByOwner.get(member._id.toString()) || [],
  }));
}

async function getWorkloadByProject(weekInput) {
  const { weekStart } = resolveWeek(weekInput);

  const reports = await Report.find({ weekStart })
    .select('project content.tasksCompleted')
    .populate('project', 'name');

  const map = new Map();
  for (const report of reports) {
    const key = report.project?._id?.toString() || 'unknown';
    const name = report.project?.name || 'Unknown';
    const tasks = report.content?.tasksCompleted || [];
    const hours = tasks.reduce((sum, task) => sum + (task.timeSpentHours || 0), 0);

    if (!map.has(key)) {
      map.set(key, { projectId: key, projectName: name, taskCount: 0, totalHours: 0 });
    }
    const entry = map.get(key);
    entry.taskCount += tasks.length;
    entry.totalHours += hours;
  }

  return Array.from(map.values());
}

async function getHoursByType(weekInput) {
  const { weekStart } = resolveWeek(weekInput);

  const reports = await Report.find({ weekStart }).select('content.hoursByType');

  const totals = { development: 0, testing: 0, meetings: 0, documentation: 0, other: 0 };
  for (const report of reports) {
    const hours = report.content?.hoursByType || {};
    for (const key of Object.keys(totals)) {
      totals[key] += hours[key] || 0;
    }
  }

  return totals;
}

async function getActivity(limit = 20) {
  const reports = await Report.find({ 'reviewComments.0': { $exists: true } })
    .select('owner project weekLabel reviewComments')
    .populate('owner', 'name')
    .populate('project', 'name')
    .populate('reviewComments.reviewer', 'name');

  const activity = [];
  for (const report of reports) {
    for (const comment of report.reviewComments) {
      activity.push({
        reportId: report._id,
        ownerName: report.owner?.name,
        projectName: report.project?.name,
        weekLabel: report.weekLabel,
        action: comment.action,
        comment: comment.comment,
        reviewerName: comment.reviewer?.name,
        createdAt: comment.createdAt,
      });
    }
  }

  activity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return activity.slice(0, limit);
}

async function getSection(weekInput, section) {
  const { weekStart } = resolveWeek(weekInput);
  const validSections = ['blockers', 'achievements'];
  if (!validSections.includes(section)) {
    const error = new Error('Invalid section');
    error.status = 400;
    throw error;
  }

  const reports = await Report.find({ weekStart })
    .select(`owner project content.${section}`)
    .populate('owner', 'name')
    .populate('project', 'name');

  return reports.map((report) => ({
    ownerName: report.owner?.name,
    projectName: report.project?.name,
    items: report.content?.[section] || [],
  }));
}

module.exports = {
  getSummary,
  getTrend,
  getStatusByMember,
  getWorkloadByProject,
  getHoursByType,
  getActivity,
  getSection,
};
