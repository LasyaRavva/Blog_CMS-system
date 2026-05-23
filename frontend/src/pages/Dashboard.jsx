import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyPostsApi, deletePostApi, createPostApi, updatePostApi } from '../services/posts';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';
import LoadingSpinner from '../components/LoadingSpinner';

const EMPTY_FORM = { title: '', body: '', status: 'DRAFT' };

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Post editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null); // post being edited, or null for new
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  async function fetchMyPosts() {
    setLoading(true);
    try {
      const data = await getMyPostsApi();
      setPosts(data);
    } catch {
      setError('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  }

  function openNewEditor() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowEditor(true);
  }

  function openEditEditor(post) {
    setEditing(post);
    setForm({ title: post.title, body: post.body || '', status: post.status });
    setFormError('');
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editing) {
        const updated = await updatePostApi(editing.id, form);
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createPostApi(form);
        setPosts((prev) => [created, ...prev]);
      }
      closeEditor();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setFormError(data.errors.map((e) => e.msg).join(', '));
      } else {
        setFormError(data?.error || 'Failed to save post');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await deletePostApi(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      alert('Failed to delete post');
    }
  }

  return (
    <div className="container page">
      {/* Header */}
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ marginBottom: '4px' }}>Dashboard</h1>
          <p className="text-muted">Welcome back, @{user?.username}</p>
        </div>
        <button className="btn btn-primary" onClick={openNewEditor}>
          + New post
        </button>
      </div>

      {/* Inline post editor */}
      {showEditor && (
        <div className="card mb-3">
          <div className="flex-between mb-2">
            <h2 style={{ fontSize: '1.2rem' }}>{editing ? 'Edit post' : 'New post'}</h2>
            <button className="btn btn-ghost" onClick={closeEditor} style={{ padding: '0.3rem 0.75rem' }}>
              ✕ Cancel
            </button>
          </div>

          {formError && <div className="alert alert-error">{formError}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Title</label>
              <input
                id="title"
                className="form-input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Post title…"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="body">Body</label>
              <textarea
                id="body"
                className="form-textarea"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Write your post here (Markdown supported)…"
                style={{ minHeight: '200px' }}
                required
              />
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
              <label className="form-label" style={{ margin: 0 }}>Status:</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 400, fontSize: '0.9rem' }}>
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={form.status === 'DRAFT'}
                  onChange={() => setForm((f) => ({ ...f, status: 'DRAFT' }))}
                />
                Draft
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 400, fontSize: '0.9rem' }}>
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={form.status === 'PUBLISHED'}
                  onChange={() => setForm((f) => ({ ...f, status: 'PUBLISHED' }))}
                />
                Published
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create post'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={closeEditor}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total posts', value: posts.length },
          { label: 'Published', value: posts.filter((p) => p.status === 'PUBLISHED').length },
          { label: 'Drafts', value: posts.filter((p) => p.status === 'DRAFT').length },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{value}</div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Posts table */}
      <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Your posts</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>You haven't written any posts yet.</p>
          <button className="btn btn-primary" onClick={openNewEditor}>Write your first post</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {posts.map((post, i) => (
            <div
              key={post.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: i < posts.length - 1 ? '1px solid var(--color-border)' : 'none',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{post.title}</span>
                  <span className={`badge badge-${post.status.toLowerCase()}`}>{post.status}</span>
                </div>
                <div className="text-muted" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span>{formatDate(post.createdAt)}</span>
                  {post._count && <span>{post._count.comments} comment{post._count.comments !== 1 ? 's' : ''}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                {post.status === 'PUBLISHED' && (
                  <Link
                    to={`/posts/${post.slug}`}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem' }}
                  >
                    View
                  </Link>
                )}
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem' }}
                  onClick={() => openEditEditor(post)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem' }}
                  onClick={() => handleDelete(post)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
