function mapUserRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPostAuthor(author) {
  if (!author) return null;
  return {
    id: author.id,
    username: author.username,
  };
}

function mapCommentRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    author: mapPostAuthor(row.author),
  };
}

function mapPostRow(row, { includeBody = true, includeComments = false } = {}) {
  if (!row) return null;

  const post = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: mapPostAuthor(row.author),
    commentsCount: Array.isArray(row.comments) ? row.comments.length : 0,
  };

  if (includeBody) {
    post.body = row.body;
  }

  if (includeComments) {
    post.comments = Array.isArray(row.comments) ? row.comments.map(mapCommentRow) : [];
  }

  return post;
}

module.exports = {
  mapUserRow,
  mapPostRow,
  mapCommentRow,
};
