const slugifyLib = require('slugify');

/**
 * Convert a title string to a URL-safe slug.
 * e.g. "Hello World!" → "hello-world"
 */
function slugify(text) {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

module.exports = { slugify };
