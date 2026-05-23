const supabase = require('../utils/supabase');
const { mapPostRow } = require('../utils/db-mappers');
const { slugify } = require('../utils/slugify');

const POST_SELECT = `
  id,
  title,
  slug,
  body,
  status,
  author_id,
  created_at,
  updated_at,
  author:users!posts_author_id_fkey(id, username),
  comments(id)
`;

const POST_DETAIL_SELECT = `
  id,
  title,
  slug,
  body,
  status,
  author_id,
  created_at,
  updated_at,
  author:users!posts_author_id_fkey(id, username),
  comments(
    id,
    body,
    created_at,
    author:users!comments_author_id_fkey(id, username)
  )
`;

/**
 * Get all published posts, newest first.
 */
async function getAllPosts({ page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('posts')
    .select(POST_SELECT, { count: 'exact' })
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) {
    error.status = 500;
    throw error;
  }

  return {
    posts: (data || []).map((post) => mapPostRow(post, { includeBody: false })),
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get a single post by slug, including its comments.
 */
async function getPostBySlug(slug) {
  const { data: post, error } = await supabase
    .from('posts')
    .select(POST_DETAIL_SELECT)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    error.status = 500;
    throw error;
  }

  if (!post || post.status !== 'PUBLISHED') {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }

  return mapPostRow(post, { includeComments: true });
}

/**
 * Create a new post. Generates slug from title.
 */
async function createPost({ title, body, status = 'DRAFT', authorId }) {
  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${Date.now()}`;

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      slug,
      body,
      status,
      author_id: authorId,
    })
    .select(POST_SELECT)
    .single();

  if (error) {
    error.status = 500;
    throw error;
  }

  return mapPostRow(data);
}

/**
 * Update a post. Only the author or admin may update.
 */
async function updatePost(id, { title, body, status }, requestingUser) {
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    fetchError.status = 500;
    throw fetchError;
  }

  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }

  if (post.author_id !== requestingUser.id && requestingUser.role !== 'ADMIN') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const data = {};
  if (title !== undefined) {
    data.title = title;
    data.slug = `${slugify(title)}-${Date.now()}`;
  }
  if (body !== undefined) data.body = body;
  if (status !== undefined) data.status = status;

  const { data: updatedPost, error } = await supabase
    .from('posts')
    .update(data)
    .eq('id', id)
    .select(POST_SELECT)
    .single();

  if (error) {
    error.status = 500;
    throw error;
  }

  return mapPostRow(updatedPost);
}

/**
 * Delete a post. Only the author or admin may delete.
 */
async function deletePost(id, requestingUser) {
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    fetchError.status = 500;
    throw fetchError;
  }

  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }

  if (post.author_id !== requestingUser.id && requestingUser.role !== 'ADMIN') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    error.status = 500;
    throw error;
  }
}

/**
 * Get all posts by the requesting user (includes drafts).
 */
async function getMyPosts(authorId) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (error) {
    error.status = 500;
    throw error;
  }

  return (data || []).map((post) => mapPostRow(post, { includeBody: false }));
}

module.exports = { getAllPosts, getPostBySlug, createPost, updatePost, deletePost, getMyPosts };
