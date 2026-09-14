const userService = require('../services/user.service');

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

function parseBooleanQuery(value) {
  if (value === undefined) {
    return undefined;
  }
  return value === 'true';
}

async function list(req, res) {
  const { role, isActive, page, limit } = req.query;
  const result = await userService.listUsers({
    role,
    isActive: parseBooleanQuery(isActive),
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json({ data: result.data.map(toPublicUser), meta: result.meta });
}

async function create(req, res) {
  const user = await userService.createUser(req.body);
  res.status(201).json({ user: toPublicUser(user) });
}

async function update(req, res) {
  const user = await userService.updateUser(req.params.id, req.body, req.user.id);
  res.json({ user: toPublicUser(user) });
}

async function getOne(req, res) {
  const user = await userService.getUserById(req.params.id);
  res.json({ user: toPublicUser(user) });
}

module.exports = { list, create, update, getOne };
