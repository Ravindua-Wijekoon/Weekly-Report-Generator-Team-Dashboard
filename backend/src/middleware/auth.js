const jwt = require('jsonwebtoken');

const env = require('../config/env');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  req.user = { id: user._id.toString(), role: user.role };
  next();
}

module.exports = { requireAuth };
