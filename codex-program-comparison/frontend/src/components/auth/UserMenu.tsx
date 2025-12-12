import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../ui/Button';
import { classNames } from '../../utils/classNames';

export function UserMenu() {
  const { user, status, isRefreshing, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (status !== 'authenticated' || !user) {
    return (
      <>
        <Link to="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="primary">Sign up</Button>
        </Link>
      </>
    );
  }

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate('/login');
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-chip" onClick={() => setOpen((isOpen) => !isOpen)} aria-label="User menu">
        <div className="avatar-chip" aria-hidden>
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="user-meta">
          <span className="user-email">{user.email}</span>
          <span className="user-role">
            {user.roles?.[0] || 'User'}
            {isRefreshing ? ' · refreshing' : ''}
          </span>
        </div>
        <span className="chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="user-dropdown">
          <button className="user-dropdown-item" onClick={() => navigate('/')}>
            Dashboard
          </button>
          <button className="user-dropdown-item" onClick={() => navigate('/portfolio')}>
            Portfolio
          </button>
          <button className={classNames('user-dropdown-item', 'danger')} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
