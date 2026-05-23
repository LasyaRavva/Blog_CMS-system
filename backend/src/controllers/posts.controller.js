const postsService = require('../services/posts.service');

/**
 * GET /api/posts
 */
async function listPosts(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await postsService.getAllPosts({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/posts/:slug
 */
async function getPost(req, res, next) {
  try {
    const post = await postsService.getPostBySlug(req.params.slug);
    res.json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/posts
 */
async function createPost(req, res, next) {
  try {
    const { title, body, status } = req.body;
    const post = await postsService.createPost({
      title,
      body,
      status,
      authorId: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/posts/:id
 */
async function updatePost(req, res, next) {
  try {
    const { title, body, status } = req.body;
    const post = await postsService.updatePost(
      req.params.id,
      { title, body, status },
      req.user
    );
    res.json(post);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/posts/:id
 */
async function deletePost(req, res, next) {
  try {
    await postsService.deletePost(req.params.id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/posts/me
 * Returns authenticated user's posts (including drafts).
 */
async function myPosts(req, res, next) {
  try {
    const posts = await postsService.getMyPosts(req.user.id);
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost, myPosts };
