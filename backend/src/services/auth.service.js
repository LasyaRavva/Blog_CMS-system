const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');
const { mapUserRow } = require('../utils/db-mappers');

const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password.
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a stored hash.
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a signed JWT for a user.
 */
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Create a new user account.
 * Throws if email or username already exists.
 */
async function createUser({ username, email, password }) {
  const passwordHash = await hashPassword(password);
  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      email,
      password_hash: passwordHash,
    })
    .select('id, username, email, role, created_at, updated_at')
    .single();

  if (error) {
    error.status = error.code === '23505' ? 409 : 500;
    throw error;
  }

  return mapUserRow(data);
}

/**
 * Verify credentials and return user + token.
 * Throws a 401 error if credentials are invalid.
 */
async function loginUser({ email, password }) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, password_hash, role, created_at, updated_at')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    error.status = 500;
    throw error;
  }

  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  const safeUser = mapUserRow(user);

  return { user: safeUser, token };
}

module.exports = { createUser, loginUser, generateToken };
