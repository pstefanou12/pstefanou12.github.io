# CLAUDE.md

Best practices for every change in this repo. What one package or app is
for, and how to work on it, lives in its own `README.md`. Repeatable
workflows (writing an MMA preview, updating the delphi.ai docs) live as
skills under `.claude/skills/`.

## Layout

The site is moving from hand-written HTML to React, one app at a time.

| Path | What it is |
|---|---|
| `packages/pat-styles/` | Shared CSS: tokens (Dracula / Alucard), primitives, the docs shell, prose. |
| `packages/pat-components/` | Shared React: the docs shell, navigation, search, theme, prose components. |
| `apps/delphi-docs/` | The delphi.ai documentation, served at `/delphi/`. |
| `index.html`, `css/`, `js/`, `mma/` | Pages not yet migrated; served as they are. |

Anything two apps could use goes in `packages/`, not in an app. Before
writing a component or a style, check whether a package already has it.

## Commands

Everything runs through `just` (see `just --list`):

```bash
just install     # npm ci
just dev         # the delphi.ai docs with hot reload
just check       # lint (gts + file headers), typecheck, unit tests
just e2e         # build _site/ and run the browser smoke test
just preview     # serve _site/, exactly what Pages deploys
```

Run `just check` before every commit. CI (`.github/workflows/pages.yml`)
runs `just check` and `just e2e` on every PR, and deploys `_site/` from
`main`. Build output is never committed.

## TypeScript

All TypeScript follows the
[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html),
enforced by gts (ESLint + Prettier). By hand:

- **File header**: every TS, TSX, JS and CSS file opens with it (ESLint and
  `just css-headers` check):

  ```ts
  /**
   * @fileoverview <one line on what this file is>.
   * Copyright 2026 Delphi Tech. All Rights Reserved.
   * Author: <github handle>@
   */
  ```

- **Files** are `snake_case.ts(x)`. Content files whose name is a URL slug
  (MDX pages) are the exception.
- **Exports** are named; `export default` only where a tool requires it
  (Vite, Vitest, Playwright configs), with a comment saying so.
- **Functions** are `function` declarations; arrows for callbacks, with a
  block body unless the value is used.
- **Types**: `interface` for object shapes, component props included;
  `readonly` for data that is not mutated; `T[]` for simple element types,
  `Array<T>` for complex ones; no `any`. Prefer a typed map
  (`Readonly<Record<K, V>>`, `ReadonlyMap`) to parallel arrays or tuples.
- **Assertions**: no `as` or `!` without a comment saying why it is safe;
  prefer a runtime check or a type guard.
- **Naming**: descriptive names; `CONSTANT_CASE` for module constants.
- **Comments**: JSDoc on every export; `//` for implementation notes.
- `===` only; `const` by default; handle every promise; never `@ts-ignore`.

## Principles

- **One source of truth.** Never hard-code a fact another system owns. The
  docs read delphi.ai's API from its manifest; navigation derives from one
  tree; a list kept in two places is a bug.
- **Strong typing end to end.** Data that crosses a boundary (JSON, props)
  has a type, and is checked where it enters.
- **Tests with every change.** Unit tests (`*_test.ts(x)`, Vitest +
  Testing Library) beside the code; the smoke test covers the assembled
  site. A bug fix comes with the test that would have caught it.
- **Small, reviewable commits**, one concern each, passing `just check`.
