# delphi docs

Documentation site for [delphi.ai](https://github.com/pstefanou12/delphi.ai),
served by GitHub Pages at `/delphi/`. Source is in `web/`; `npm run build:delphi`
writes the built site to this directory (`index.html`, `assets/`), which is
committed, as `mma/dist/` is.

```bash
npm run dev:delphi        # dev server with hot reload
npm run docs:api          # regenerate web/src/generated/api.json from ~/delphi.ai
                          # (set DELPHI_AI=/path/to/delphi.ai to override)
npm run lint:delphi       # Google TypeScript style (gts); fix:delphi auto-fixes
npm run typecheck:delphi
npm run build:delphi      # then commit delphi/index.html and delphi/assets
```

- `web/src/content/registry.ts`: every page and its place in the sidebar.
- `web/src/content/guides/*.mdx`, `web/src/content/algorithms/<slug>.mdx`: prose
  and math (`$...$`, `$$...$$`). An algorithm page without an MDX file renders
  from the generated API alone.
- `scripts/extract_api.py`: signatures, docstrings and config defaults of every
  model in its `MODELS` list.

TypeScript follows the Google style guide; see the root `CLAUDE.md`.
