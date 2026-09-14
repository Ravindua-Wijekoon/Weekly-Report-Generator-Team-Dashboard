const projectService = require('../services/project.service');

function parseBooleanQuery(value) {
  if (value === undefined) {
    return undefined;
  }
  return value === 'true';
}

async function list(req, res) {
  const projects = await projectService.listProjects({
    isActive: parseBooleanQuery(req.query.isActive),
    memberId: req.query.mine === 'true' ? req.user.id : undefined,
  });
  res.json({ data: projects });
}

async function create(req, res) {
  const project = await projectService.createProject(req.body, req.user.id);
  res.status(201).json({ project });
}

async function update(req, res) {
  const project = await projectService.updateProject(req.params.id, req.body);
  res.json({ project });
}

async function remove(req, res) {
  await projectService.softDeleteProject(req.params.id);
  res.status(204).send();
}

module.exports = { list, create, update, remove };
