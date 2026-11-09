import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import {version} from '../api';
import {GITHUB} from '../content/registry';

type Theme = 'light' | 'dark';

const THEME_KEY = 'delphi-docs-theme';

function storedTheme(): Theme | null {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === 'light' || theme === 'dark' ? theme : null;
  } catch {
    // Storage is blocked (private mode): follow the system theme.
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Props of TopBar. */
export interface TopBarProps {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}

/** The brand, external links, the theme toggle and the mobile menu button. */
export function TopBar({drawerOpen, onToggleDrawer}: TopBarProps) {
  const [theme, setTheme] = useState<Theme | null>(storedTheme);

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);

  function toggleTheme() {
    const next: Theme = (theme ?? systemTheme()) === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage is blocked (private mode): the choice lasts for this visit.
    }
  }

  return (
    <header className="topbar">
      <button
        className="icon-button menu-button"
        aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={drawerOpen}
        onClick={onToggleDrawer}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <Link to="/" className="brand">
        <span className="brand-mark">δ</span>
        <span className="brand-name">delphi</span>
        {version && <span className="brand-version">v{version}</span>}
      </Link>
      <nav className="topbar-links">
        <a href="../">pstefanou12</a>
        <a href={GITHUB} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <button
          className="icon-button"
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M10 2.5a7.5 7.5 0 1 0 7.5 7.5A5.8 5.8 0 0 1 10 2.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </nav>
    </header>
  );
}
