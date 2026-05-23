const { createUser, loginUser, generateToken } = require('../services/auth.service');

/**
 * POST /api/auth/signup
 */
async function signup(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const user = await createUser({ username, email, password });
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (set by authenticate middleware).
 */
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { signup, login, me };
