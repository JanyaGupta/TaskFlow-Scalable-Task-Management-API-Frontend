import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">T</div>
        <span className="sidebar-logo-name">TaskFlow</span>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`}
        >
          <span className="sidebar-icon">▦</span>
          Dashboard
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className={`sidebar-link ${pathname === '/admin' ? 'active' : ''}`}
          >
            <span className="sidebar-icon">⚙</span>
            Admin
          </Link>
        )}

        <a
          href="http://localhost:5000/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link"
        >
          <span className="sidebar-icon">⌗</span>
          API Docs
        </a>
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div className="avatar-name">{user?.name}</div>
            <div className="avatar-role">{user?.role}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout}>
          ← Sign out
        </button>
      </div>
    </aside>
  );
}
