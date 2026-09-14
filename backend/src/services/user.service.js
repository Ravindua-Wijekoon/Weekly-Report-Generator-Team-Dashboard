const User = require('../models/User');
const authService = require('./auth.service');

async function listUsers({ role, isActive, page = 1, limit = 20 } = {}) {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User.find(filter).sort('name').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function createUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email is already registered');
    error.status = 409;
    throw error;
  }

  const passwordHash = await authService.hashPassword(password);
  return User.create({ name, email, passwordHash, role: role || 'member' });
}

async function updateUser(id, updates, requesterId) {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (user.role === 'manager' && updates.role && updates.role !== 'manager') {
    const error = new Error("A manager's role cannot be changed");
    error.status = 409;
    throw error;
  }

  if (updates.isActive === false && requesterId && id === requesterId) {
    const error = new Error('You cannot deactivate your own account');
    error.status = 409;
    throw error;
  }

  Object.assign(user, updates);
  await user.save();
  return user;
}

async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
}

module.exports = { listUsers, createUser, updateUser, getUserById };
