const router = require('express').Router();
const { body } = require('express-validator');
const {
  listPosts, getPost, createPost, updatePost, deletePost, myPosts,
} = require('../controllers/posts.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public routes
router.get('/', listPosts);
router.get('/me', authenticate, myPosts);  // Must be before /:slug
router.get('/:slug', getPost);

// Protected routes
router.post(
  '/',
  authenticate,
  [
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('body').trim().isLength({ min: 10 }).withMessage('Body must be at least 10 characters'),
    body('status').optional().isIn(['DRAFT', 'PUBLISHED']).withMessage('Status must be DRAFT or PUBLISHED'),
  ],
  validate,
  createPost
);

router.put(
  '/:id',
  authenticate,
  [
    body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('body').optional().trim().isLength({ min: 10 }).withMessage('Body must be at least 10 characters'),
    body('status').optional().isIn(['DRAFT', 'PUBLISHED']).withMessage('Status must be DRAFT or PUBLISHED'),
  ],
  validate,
  updatePost
);

router.delete('/:id', authenticate, deletePost);

module.exports = router;
