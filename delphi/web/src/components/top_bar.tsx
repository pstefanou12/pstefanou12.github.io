import {useEffect, useState} from 'react';
import {Link, NavLink, useLocation} from 'react-router-dom';

import {version} from '../api';
import {GITHUB, PARTS, partOf} from '../content/registry';
import {Search} from './search';

type Theme = 'light' | 'dark';

const THEME_KEY = 'delphi-docs-theme';

// Dracula (dark) unless the reader picked Alucard (light) before.
function storedTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    // Storage is blocked (private mode): start from the default.
    return 'dark';
  }
}

/** Props of TopBar. */
export interface TopBarProps {
  drawerOpen: boolean;
  onToggleDrawer: () => void;
}

/** The navbar: brand, the docs' parts as tabs, search, GitHub and theme. */
export function TopBar({drawerOpen, onToggleDrawer}: TopBarProps) {
  const [theme, setTheme] = useState<Theme>(storedTheme);
  const {pathname} = useLocation();
  const activePart = partOf(pathname.replace(/^\//, ''))?.id;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
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
        <span className="brand-name">delphi.ai</span>
        {version && <span className="brand-version">{version}</span>}
      </Link>
      <nav className="part-tabs" aria-label="Parts of the docs">
        {PARTS.map(part => (
          <NavLink
            key={part.id}
            to={`/${part.sections[0].pages[0].slug}`}
            className={`part-tab${part.id === activePart ? ' active' : ''}`}
          >
            {part.title}
          </NavLink>
        ))}
      </nav>
      <div className="topbar-end">
        <Search />
        <a
          className="icon-button"
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="delphi.ai on GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
        </a>
        <button
          className="icon-button"
          aria-label={
            theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
          }
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
              <circle
                cx="10"
                cy="10"
                r="3.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M10 1.5v2.2M10 16.3v2.2M1.5 10h2.2M16.3 10h2.2M4 4l1.6 1.6M14.4 14.4L16 16M4 16l1.6-1.6M14.4 5.6L16 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M10 2.5a7.5 7.5 0 1 0 7.5 7.5A5.8 5.8 0 0 1 10 2.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
