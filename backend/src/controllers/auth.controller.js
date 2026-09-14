const authService = require('../services/auth.service');
const User = require('../models/User');
const env = require('../config/env');

const COOKIE_NAME = 'token';

function setAuthCookie(res, token) {
  const isProduction = env.nodeEnv === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

async function register(req, res) {
  const user = await authService.registerMember(req.body);
  const token = authService.signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ user: toPublicUser(user) });
}

async function login(req, res) {
  const user = await authService.login(req.body);
  const token = authService.signToken(user);
  setAuthCookie(res, token);
  res.json({ user: toPublicUser(user) });
}

function logout(req, res) {
  const isProduction = env.nodeEnv === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.status(204).send();
}

async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: toPublicUser(user) });
}

module.exports = { register, login, logout, me };
