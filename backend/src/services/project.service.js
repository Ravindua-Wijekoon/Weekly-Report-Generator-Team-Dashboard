const Project = require('../models/Project');

async function listProjects({ isActive, memberId } = {}) {
  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive;
  }
  // A project with no members assigned is open to everyone, so "my projects"
  // includes both projects I'm explicitly on and projects with no restriction.
  // "members.0 doesn't exist" covers both an empty array and older documents
  // that predate this field and never had "members" written at all.
  if (memberId) {
    filter.$or = [{ 'members.0': { $exists: false } }, { members: memberId }];
  }
  return Project.find(filter).sort('name').populate('members', 'name email');
}

async function createProject(data, userId) {
  const existing = await Project.findOne({ name: data.name });
  if (existing) {
    const error = new Error('A project with this name already exists');
    error.status = 409;
    throw error;
  }
  return Project.create({ ...data, createdBy: userId });
}

async function updateProject(id, data) {
  const project = await Project.findById(id);
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }
  Object.assign(project, data);
  await project.save();
  return project;
}

async function softDeleteProject(id) {
  return updateProject(id, { isActive: false });
}

module.exports = { listProjects, createProject, updateProject, softDeleteProject };
