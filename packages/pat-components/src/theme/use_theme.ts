/**
 * @fileoverview The light/dark theme, applied to <html data-theme> and
 * remembered per browser, shared by every app on the site.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {useCallback, useEffect, useState} from 'react';

/** The two themes: Dracula (dark) and Alucard (light). */
export type Theme = 'dark' | 'light';

/** The theme and a way to flip it. */
export interface ThemeState {
  readonly theme: Theme;
  readonly toggle: () => void;
}

/** The localStorage key every app on the site shares. */
export const THEME_STORAGE_KEY = 'pat-theme';

/** The theme a first visit gets: the site's Dracula palette. */
export const DEFAULT_THEME: Theme = 'dark';

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
  } catch {
    // Storage is blocked (private mode): start from the default.
    return DEFAULT_THEME;
  }
}

/** Returns the current theme, kept on <html data-theme> and in storage. */
export function useTheme(): ThemeState {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(current => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Storage is blocked (private mode): the choice lasts for this visit.
      }
      return next;
    });
  }, []);

  return {theme, toggle};
}
