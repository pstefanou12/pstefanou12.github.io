/**
 * @fileoverview Tests for the theme hook and toggle.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it} from 'vitest';

import {ThemeToggle} from './theme_toggle';
import {THEME_STORAGE_KEY} from './use_theme';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('starts dark and flips to light, remembering the choice', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    expect(document.documentElement.dataset.theme).toBe('dark');
    await user.click(
      screen.getByRole('button', {name: 'Switch to light theme'}),
    );
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('starts from a stored choice', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    render(<ThemeToggle />);
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
