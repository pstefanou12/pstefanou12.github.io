/**
 * @fileoverview Adds Testing Library's DOM matchers and cleans up after each
 * test.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import '@testing-library/jest-dom/vitest';

import {cleanup} from '@testing-library/react';
import {afterEach} from 'vitest';

afterEach(() => {
  cleanup();
});
