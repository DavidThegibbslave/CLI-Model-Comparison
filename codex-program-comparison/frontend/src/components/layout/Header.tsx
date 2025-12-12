import { NavLink } from 'react-router-dom';
import { classNames } from '../../utils/classNames';
import { UserMenu } from '../auth/UserMenu';
import { ThemeSwitcher } from './ThemeSwitcher';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/compare', label: 'Compare' },
  { to: '/store', label: 'Store' },
  { to: '/cart', label: 'Cart' },
  { to: '/portfolio', label: 'Portfolio' },
];

type HeaderProps = {
  onMenuToggle?: () => void;
};

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-badge">CM</div>
        <span>CryptoMarket</span>
      </div>

      <nav className="nav-links">
        {navLinks.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => classNames('nav-link', isActive && 'active')}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-actions">
        <button className="icon-button mobile-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          ☰
        </button>
        <ThemeSwitcher />
        <div className="header-user">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
