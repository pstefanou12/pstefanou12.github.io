# CLAUDE.md

## TypeScript style

All TypeScript (`.ts`, `.tsx`, `.mts`) follows the
[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html).
[gts](https://github.com/google/gts), Google's ESLint and Prettier preset,
enforces most of it. The rules below are the ones it does not check.

### Linting

```bash
npm run lint:delphi        # eslint + prettier, via eslint.config.js
npm run fix:delphi         # apply the automatic fixes (formatting, quotes)
npm run typecheck:delphi
```

Run all three before committing changes under `delphi/web/`. `mma/` predates
this rule and is excluded in `eslint.config.js`. When a change touches
`mma/src/`, bring the files it changes up to the guide and remove `mma/` from
the ignores once all of it complies.

### Rules to apply by hand

- **Files**: `snake_case.ts` / `snake_case.tsx` (`algorithm_page.tsx`, not
  `AlgorithmPage.tsx`). MDX content under `content/` is the exception: its
  file name is the page's URL slug, which is kebab-case.
- **Exports**: named exports only, never `export default`. The exception is
  config files whose tool requires a default export (`vite.config.mts`), with
  a comment saying so. Never `export let`. Use plain exported functions and
  constants, not classes that only hold statics.
- **Imports**: ES modules with relative paths inside the project. Use
  `import type` for type-only imports.
- **Functions**: write named functions as `function` declarations, not
  `const f = () => ...`. Use arrow functions for callbacks. A concise arrow
  body only when its value is used: `onClick={() => { setOpen(false); }}`,
  not `onClick={() => setOpen(false)}`.
- **Naming**: `UpperCamelCase` for types, interfaces and React components.
  `lowerCamelCase` for variables, functions, parameters and properties.
  `CONSTANT_CASE` for module-level constants that are never mutated. Treat
  acronyms as words (`MdxBody`, `loadHttpUrl`). No `_` prefixes or suffixes.
  Use descriptive names outside scopes of a few lines.
- **Types**: use `interface` for object shapes, including component props
  (`export interface FooProps`, not inline `{foo}: {foo: string}`). Use
  `type` for unions, functions and other non-object types. Write `T[]` for
  simple element types and `Array<T>` for complex ones. Avoid `any`, and use
  `unknown` when the type is truly unknown.
- **Assertions**: avoid `as` and the non-null `!`. Check at runtime instead,
  e.g. `if (!root) throw new Error(...)`, or narrow with a type guard
  (`isValidElement<P>(x)`). When an assertion is unavoidable, add a comment
  saying why it is safe.
- **Control flow**: `===` and `!==` only, except `== null`. `const` by
  default and `let` only when reassigned. Never `var`. `for...of` over arrays.
  Throw only `new Error(...)`. Never leave a `catch` block empty without a
  comment explaining why. Never `@ts-ignore`, `@ts-expect-error` or
  `@ts-nocheck`.
- **Promises**: handle every promise: `await` it, give `.then` a rejection
  handler, or mark it ignored with `void` (gts lints this).
- **Comments**: use `/** JSDoc */` on every exported symbol and for anything a
  caller should read. Use `//` for implementation notes, and several `//`
  lines rather than `/* */` blocks.
