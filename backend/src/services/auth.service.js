const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const User = require('../models/User');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

async function registerMember({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email is already registered');
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role: 'member' });
  return user;
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const matches = await comparePassword(password, user.passwordHash);
  if (!matches) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  return user;
}

module.exports = { hashPassword, comparePassword, signToken, registerMember, login };
