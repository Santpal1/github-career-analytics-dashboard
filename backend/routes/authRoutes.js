const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'github_career_analytics_secret_key_123';

/**
 * POST /api/auth/login-mock
 * A mock endpoint that creates a JWT for testing authentication flow locally.
 */
router.post('/login-mock', (req, res) => {
  const { username, role } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const payload = {
    username: username.trim(),
    role: role || 'developer',
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  
  res.json({
    token,
    user: {
      username: payload.username,
      role: payload.role
    }
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user details.
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token missing or invalid.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      user: {
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Access token has expired or is invalid.' });
  }
});

module.exports = router;
