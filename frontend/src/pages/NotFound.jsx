import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container page text-center" style={{ paddingTop: '5rem' }}>
      <h1 style={{ fontSize: '5rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Page not found</h2>
      <p className="text-muted mb-3">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Go home
      </Link>
    </div>
  );
}
