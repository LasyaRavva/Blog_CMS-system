import { useState, useEffect } from 'react';
import { getPostsApi } from '../services/posts';

export function usePosts(page = 1) {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPostsApi({ page })
      .then(({ posts, total, totalPages }) => {
        if (!cancelled) {
          setPosts(posts);
          setMeta({ total, totalPages });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.error || 'Failed to load posts');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page]);

  return { posts, meta, loading, error };
}
