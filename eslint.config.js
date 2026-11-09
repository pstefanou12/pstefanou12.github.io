// ESLint flat config: Google's TypeScript style via gts
// (https://google.github.io/styleguide/tsguide.html). Formatting comes from
// gts's Prettier settings in .prettierrc.js.
const gts = require('gts');

module.exports = [
  {
    // Built output, and code that predates the style rule (mma/), which
    // adopts it when next changed.
    ignores: ['**/node_modules/', 'delphi/assets/', 'mma/', 'js/'],
  },
  ...gts,
  {
    files: ['delphi/web/**/*.{ts,tsx,mts}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {jsx: true},
        project: './delphi/web/tsconfig.json',
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
