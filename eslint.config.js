/**
 * @fileoverview ESLint flat config: Google's TypeScript style via gts, plus
 * the house file-header rule. Formatting comes from .prettierrc.js.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

'use strict';

const gts = require('gts');
const globals = require('globals');

const fileHeader = require('./tools/eslint/file_header_rule.js');

module.exports = [
  {
    // Build output, and code that predates the style rule (mma/, js/), which
    // adopts it when next changed.
    ignores: ['**/node_modules/', '**/dist/', '_site/', 'mma/', 'js/'],
  },
  ...gts,
  {
    // Node tooling (this config, Prettier's, the local ESLint rules).
    files: ['*.js', 'tools/**/*.js'],
    languageOptions: {sourceType: 'commonjs', globals: globals.node},
  },
  {
    plugins: {pat: {rules: {'file-header': fileHeader}}},
    rules: {'pat/file-header': 'error'},
  },
  {
    files: ['packages/**/*.{ts,tsx}', 'apps/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {jsx: true},
        project: false,
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Browser code bundled by Vite: the Node plugin's import checks do
      // not apply.
      'n/no-missing-import': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-extraneous-import': 'off',
    },
  },
];
