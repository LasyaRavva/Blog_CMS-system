import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createCommentApi, deleteCommentApi } from '../services/posts';
import { timeAgo } from '../utils/formatDate';
import { Link } from 'react-router-dom';

export default function CommentList({ postId, initialComments }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments || []);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const comment = await createCommentApi({ body, postId });
      setComments((prev) => [...prev, comment]);
      setBody('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCommentApi(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Failed to delete comment');
    }
  }

  return (
    <section className="mt-3">
      <h3 style={{ marginBottom: '1rem' }}>
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h3>

      {comments.length === 0 && (
        <p className="text-muted mb-2">No comments yet. Be the first!</p>
      )}

      {comments.map((comment) => (
        <div
          key={comment.id}
          className="card"
          style={{ marginBottom: '0.75rem', padding: '1rem 1.25rem' }}
        >
          <div className="flex-between" style={{ marginBottom: '6px' }}>
            <span style={{ fontWeight: 500 }}>@{comment.author.username}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="text-muted">{timeAgo(comment.createdAt)}</span>
              {user && (user.id === comment.author.id || user.role === 'ADMIN') && (
                <button
                  className="btn btn-ghost"
                  style={{ padding: '2px 8px', fontSize: '0.8rem', color: 'var(--color-danger)' }}
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <p style={{ color: 'var(--color-text)', lineHeight: '1.6' }}>{comment.body}</p>
        </div>
      ))}

      {user ? (
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>Add a comment</h4>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Share your thoughts..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </form>
      ) : (
        <p className="text-muted mt-2">
          <Link to="/login">Log in</Link> to leave a comment.
        </p>
      )}
    </section>
  );
}
