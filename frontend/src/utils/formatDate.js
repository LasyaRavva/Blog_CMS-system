/**
 * Format an ISO date string to a human-readable date.
 * e.g. "2024-03-15T10:30:00Z" → "Mar 15, 2024"
 */
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Return a relative time string.
 * e.g. "2 hours ago", "3 days ago"
 */
export function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
  const units = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [div, label] of units) {
    const n = Math.floor(seconds / div);
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}
