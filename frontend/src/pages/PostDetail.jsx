import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostApi, deletePostApi } from '../services/posts';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import CommentList from '../components/CommentList';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getPostApi(slug)
      .then(setPost)
      .catch((err) => setError(err.response?.data?.error || 'Post not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deletePostApi(post.id);
      navigate('/posts');
    } catch {
      alert('Failed to delete post');
    }
  }

  if (loading) return <div className="container page"><LoadingSpinner /></div>;
  if (error) {
    return (
      <div className="container page text-center">
        <div className="alert alert-error" style={{ display: 'inline-block' }}>{error}</div>
        <div className="mt-2"><Link to="/posts" className="btn btn-ghost">← Back to posts</Link></div>
      </div>
    );
  }

  const canManage = user && (user.id === post.author.id || user.role === 'ADMIN');

  return (
    <div className="container page">
      <div className="mb-2">
        <Link to="/posts" className="text-muted" style={{ fontSize: '0.9rem' }}>
          ← Back to posts
        </Link>
      </div>

      <article className="card mb-3">
        <header style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <h1 style={{ marginBottom: '0.75rem' }}>{post.title}</h1>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <div className="text-muted" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span>by <strong>@{post.author.username}</strong></span>
              <span>{formatDate(post.createdAt)}</span>
              {post.updatedAt !== post.createdAt && (
                <span>Updated {formatDate(post.updatedAt)}</span>
              )}
            </div>
            {canManage && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to={`/dashboard/edit/${post.id}`}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.85rem', padding: '0.3rem 0.85rem' }}
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: '0.85rem', padding: '0.3rem 0.85rem' }}
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Render body as pre-formatted (for Week 3 — swap with markdown renderer in Week 4) */}
        <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
          {post.body}
        </div>
      </article>

      <CommentList postId={post.id} initialComments={post.comments} />
    </div>
  );
}
