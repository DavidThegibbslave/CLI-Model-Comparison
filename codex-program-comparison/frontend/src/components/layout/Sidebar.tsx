import { Link, NavLink } from 'react-router-dom';
import { classNames } from '../../utils/classNames';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../ui/Button';

const navLinks = [
  { to: '/', label: 'Dashboard', badge: 'Live' },
  { to: '/compare', label: 'Compare', badge: 'New' },
  { to: '/store', label: 'Store', badge: 'Shop' },
  { to: '/cart', label: 'Cart', badge: 'Items' },
  { to: '/portfolio', label: 'Portfolio', badge: 'Alpha' },
];

type SidebarProps = {
  open?: boolean;
};

export function Sidebar({ open = true }: SidebarProps) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <aside className={classNames('sidebar', open && 'open')}>
      <div className="sidebar-section">
        <h4 className="sidebar-heading">Navigation</h4>
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => classNames('sidebar-link', isActive && 'active')}
          >
            <span>{item.label}</span>
            <span className="badge">{item.badge}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-section" style={{ marginTop: 'var(--space-6)' }}>
        <h4 className="sidebar-heading">System pulse</h4>
        <div className="list">
          <div className="list-item">
            <span>Market feed</span>
            <span className="pill pill-success">Stable</span>
          </div>
          <div className="list-item">
            <span>API quota</span>
            <span className="pill">72% free</span>
          </div>
          <div className="list-item">
            <span>Latency</span>
            <span className="pill">190 ms</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section sidebar-auth">
        {isAuthenticated && user ? (
          <>
            <div className="user-chip" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <div className="avatar-chip" aria-hidden>
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="user-meta">
                <span className="user-email">{user.email}</span>
                <span className="user-role">{user.roles?.[0] ?? 'User'}</span>
              </div>
            </div>
            <Button variant="ghost" onClick={() => void logout()} style={{ width: '100%' }}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" style={{ width: '100%' }}>
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button style={{ width: '100%' }}>
                Sign up
              </Button>
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
