const supabase = require('../utils/supabase');
const { mapCommentRow } = require('../utils/db-mappers');

/**
 * POST /api/comments
 */
async function createComment(req, res, next) {
  try {
    const { body, postId } = req.body;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, status')
      .eq('id', postId)
      .maybeSingle();

    if (postError) {
      return res.status(500).json({ error: 'Failed to load post' });
    }

    if (!post || post.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Post not found' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        body,
        post_id: postId,
        author_id: req.user.id,
      })
      .select(`
        id,
        body,
        created_at,
        author:users!comments_author_id_fkey(id, username)
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to create comment' });
    }

    res.status(201).json(mapCommentRow(comment));
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/comments/:id
 */
async function deleteComment(req, res, next) {
  try {
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id, author_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ error: 'Failed to load comment' });
    }

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.author_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error } = await supabase.from('comments').delete().eq('id', req.params.id);

    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to delete comment' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createComment, deleteComment };
