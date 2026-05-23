/**
 * Global Express error handler.
 * Catches errors passed via next(err) from any route.
 */
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (err.code === '23505') {
    const detail = err.details || err.message || 'Unique constraint violation';
    return res.status(409).json({ error: detail });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: err.message || 'Invalid related record' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
