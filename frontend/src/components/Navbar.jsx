import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Blog<span>CMS</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Home
          </NavLink>
          <NavLink to="/posts" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Posts
          </NavLink>

          {user ? (
            <>
              <div className="nav-divider" />
              <NavLink
                to="/dashboard"
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              >
                Dashboard
              </NavLink>
              <div className="navbar-user">
                <span className="navbar-username">@{user.username}</span>
                <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '0.35rem 0.85rem' }}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="nav-divider" />
              <NavLink to="/login" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Login
              </NavLink>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.35rem 1rem', fontSize: '0.875rem' }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
