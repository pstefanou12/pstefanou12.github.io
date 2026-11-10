/**
 * @fileoverview Vitest for the delphi.ai docs: jsdom, with the MDX pipeline
 * so tests can import pages.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {defineConfig} from 'vitest/config';

// Vitest reads its config from the default export.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*_test.{ts,tsx}'],
    setupFiles: ['../../packages/pat-components/vitest.setup.ts'],
  },
});
