const reportService = require('../services/report.service');

async function list(req, res) {
  const { project, status, weekStart, weekEnd, page, limit, sort, mine } = req.query;

  let owner;
  if (req.user.role !== 'manager' || mine === 'true') {
    owner = req.user.id;
  } else {
    owner = req.query.owner;
  }

  const result = await reportService.listReports({
    owner,
    project,
    status,
    weekStart,
    weekEnd,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sort,
  });

  res.json(result);
}

async function create(req, res) {
  const report = await reportService.createDraft({ owner: req.user.id, ...req.body });
  res.status(201).json({ report });
}

function getOne(req, res) {
  res.json({ report: req.report });
}

async function update(req, res) {
  const report = await reportService.updateContent(req.report, req.body);
  res.json({ report });
}

module.exports = { list, create, getOne, update };
