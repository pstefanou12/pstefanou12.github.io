/**
 * @fileoverview Vitest for pat-components: jsdom, with Testing Library's
 * matchers.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {defineConfig} from 'vitest/config';

// Vitest reads its config from the default export.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*_test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
