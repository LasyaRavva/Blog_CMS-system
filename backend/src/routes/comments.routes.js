const router = require('express').Router();
const { body } = require('express-validator');
const { createComment, deleteComment } = require('../controllers/comments.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/comments
router.post(
  '/',
  authenticate,
  [
    body('body').trim().isLength({ min: 1 }).withMessage('Comment body required'),
    body('postId').isUUID().withMessage('Valid postId required'),
  ],
  validate,
  createComment
);

// DELETE /api/comments/:id
router.delete('/:id', authenticate, deleteComment);

module.exports = router;
