import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { designTokens, type ThemeName } from '../../styles/theme';
import { classNames } from '../../utils/classNames';

const themeDescriptions: Record<ThemeName, string> = {
  light: 'Bright + neutral',
  dark: 'Deep navy contrast',
  midnight: 'Neon midnight',
  sunrise: 'Warm sunrise',
};

function toTitle(name: ThemeName) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function ThemeSwitcher() {
  const { theme, setTheme, toggleTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo(() => themes, [themes]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="theme-switcher" ref={menuRef}>
      <button
        className="theme-button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-label="Change theme"
        aria-expanded={open}
      >
        <span className="theme-dot" style={{ background: designTokens.themes[theme].primary }} />
        <span className="theme-label">{toTitle(theme)}</span>
        <span aria-hidden className="chevron">
          ▾
        </span>
      </button>

      {open && (
        <div className="theme-menu">
          {options.map((name) => {
            const palette = designTokens.themes[name];
            return (
              <button
                key={name}
                className={classNames('theme-menu-item', theme === name && 'active')}
                onClick={() => {
                  setTheme(name);
                  setOpen(false);
                }}
              >
                <span className="theme-dot" style={{ background: palette.primary }} />
                <div className="theme-meta">
                  <span className="theme-name">{toTitle(name)}</span>
                  <span className="theme-desc">{themeDescriptions[name]}</span>
                </div>
              </button>
            );
          })}
          <button className="theme-menu-item subtle" onClick={() => toggleTheme()}>
            <span className="theme-dot" />
            <div className="theme-meta">
              <span className="theme-name">Cycle</span>
              <span className="theme-desc">Next theme in list</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
