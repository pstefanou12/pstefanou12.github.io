/**
 * @fileoverview The navbar button that flips between the dark and light themes.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {useTheme} from './use_theme';

function SunIcon() {
  return (
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
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 2.5a7.5 7.5 0 1 0 7.5 7.5A5.8 5.8 0 0 1 10 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Switches theme; shows the icon of the theme it switches to. */
export function ThemeToggle() {
  const {theme, toggle} = useTheme();
  return (
    <button
      className="icon-button"
      aria-label={
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      }
      onClick={toggle}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
