const dashboardService = require('../services/dashboard.service');

async function summary(req, res) {
  const data = await dashboardService.getSummary(req.query.week);
  res.json(data);
}

async function trend(req, res) {
  const { weeks, project, owner } = req.query;
  const data = await dashboardService.getTrend({
    weeks: weeks ? Number(weeks) : undefined,
    project,
    owner,
  });
  res.json({ data });
}

async function statusByMember(req, res) {
  const data = await dashboardService.getStatusByMember(req.query.week);
  res.json({ data });
}

async function workloadByProject(req, res) {
  const data = await dashboardService.getWorkloadByProject(req.query.week);
  res.json({ data });
}

async function hoursByType(req, res) {
  const data = await dashboardService.getHoursByType(req.query.week);
  res.json(data);
}

async function activity(req, res) {
  const data = await dashboardService.getActivity(req.query.limit ? Number(req.query.limit) : undefined);
  res.json({ data });
}

async function section(req, res) {
  const data = await dashboardService.getSection(req.query.week, req.query.section);
  res.json({ data });
}

module.exports = { summary, trend, statusByMember, workloadByProject, hoursByType, activity, section };
