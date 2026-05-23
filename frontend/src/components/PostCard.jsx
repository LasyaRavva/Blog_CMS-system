import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';

export default function PostCard({ post }) {
  const excerpt = post.body
    ? post.body.replace(/[#*`]/g, '').slice(0, 160) + '…'
    : '';

  return (
    <article className="card" style={{ marginBottom: '1rem' }}>
      <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <Link to={`/posts/${post.slug}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{post.title}</h2>
          </Link>
          <div className="text-muted" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span>by <strong>@{post.author?.username}</strong></span>
            <span>{formatDate(post.createdAt)}</span>
            {post._count && <span>{post._count.comments} comment{post._count.comments !== 1 ? 's' : ''}</span>}
          </div>
        </div>
        {post.status && (
          <span className={`badge badge-${post.status.toLowerCase()}`}>{post.status}</span>
        )}
      </div>
      {excerpt && <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{excerpt}</p>}
      <div className="mt-2">
        <Link to={`/posts/${post.slug}`} className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
          Read more →
        </Link>
      </div>
    </article>
  );
}
