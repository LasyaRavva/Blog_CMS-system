import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupApi } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  function validate() {
    const errs = {};
    if (form.username.length < 3) errs.username = 'At least 3 characters required';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Letters, numbers, and underscores only';
    if (!form.email.includes('@')) errs.email = 'Valid email required';
    if (form.password.length < 6) errs.password = 'At least 6 characters required';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await signupApi({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      // Handle server-side validation errors array
      const data = err.response?.data;
      if (data?.errors) {
        const mapped = {};
        data.errors.forEach((e) => { mapped[e.path] = e.msg; });
        setErrors(mapped);
      } else {
        setServerError(data?.error || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: '420px' }}>
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create an account</h1>
        <p className="text-muted mb-3">Join the community</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              value={form.username}
              onChange={handleChange}
              placeholder="jane_dev"
              required
              autoComplete="username"
            />
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              className="form-input"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
            />
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-muted text-center mt-2" style={{ fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
