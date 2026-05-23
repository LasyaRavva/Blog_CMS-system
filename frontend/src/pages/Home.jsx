import { Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { posts, loading } = usePosts(1);
  const { user } = useAuth();
  const featured = posts.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '4rem 1.25rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>
            Ideas worth sharing
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.7' }}>
            A platform for developers to write, share, and discuss technical ideas.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/posts" className="btn btn-primary">
              Browse posts
            </Link>
            {!user && (
              <Link to="/signup" className="btn btn-ghost">
                Start writing
              </Link>
            )}
            {user && (
              <Link to="/dashboard" className="btn btn-ghost">
                My dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Recent posts */}
      <div className="container page">
        <div className="flex-between mb-3">
          <h2>Recent posts</h2>
          <Link to="/posts" className="text-muted" style={{ fontSize: '0.9rem' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : featured.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p className="text-muted">No posts yet. Be the first to write one!</p>
          </div>
        ) : (
          featured.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
