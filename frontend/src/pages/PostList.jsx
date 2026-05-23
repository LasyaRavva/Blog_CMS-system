import { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PostList() {
  const [page, setPage] = useState(1);
  const { posts, meta, loading, error } = usePosts(page);

  return (
    <div className="container page">
      <div className="flex-between mb-3">
        <h1>All posts</h1>
        <span className="text-muted">{meta.total} post{meta.total !== 1 ? 's' : ''}</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-muted">No posts found.</p>
        </div>
      ) : (
        <>
          {posts.map((post) => <PostCard key={post.id} post={post} />)}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex" style={{ justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
              <button
                className="btn btn-ghost"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <span className="text-muted" style={{ alignSelf: 'center', fontSize: '0.9rem' }}>
                Page {page} of {meta.totalPages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page === meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
