/**
 * @fileoverview Playwright smoke test of the assembled site (`just site`),
 * served the way GitHub Pages serves it.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {defineConfig, devices} from '@playwright/test';

const PORT = 8765;

// CI installs Playwright's own Chromium; locally, CHROMIUM_PATH can point at
// any installed Chromium instead of downloading one.
const executablePath = process.env.CHROMIUM_PATH || undefined;

// Playwright reads its config from the default export.
export default defineConfig({
  testDir: './e2e',
  testMatch: '*_test.ts',
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}/`,
    launchOptions: {executablePath},
  },
  projects: [
    {
      name: 'desktop',
      use: {...devices['Desktop Chrome'], launchOptions: {executablePath}},
    },
    {
      name: 'mobile',
      use: {...devices['Pixel 7'], launchOptions: {executablePath}},
    },
  ],
  webServer: {
    command: `python3 -m http.server ${PORT} -d _site`,
    cwd: '../..',
    url: `http://localhost:${PORT}/delphi/`,
    reuseExistingServer: false,
  },
});
