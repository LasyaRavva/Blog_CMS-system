const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');
const { mapUserRow } = require('../utils/db-mappers');

/**
 * Middleware: verify JWT and attach user to req.user.
 * Sends 401 if token is missing or invalid.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at, updated_at')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Failed to load user' });
    }

    const user = mapUserRow(data);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware: require ADMIN role. Must run after authenticate.
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
