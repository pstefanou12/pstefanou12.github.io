---
name: delphi-docs
description: Update the delphi.ai documentation in apps/delphi-docs: refresh the API manifest from delphi.ai, add or edit a model or guide page, and preview the site. Use when delphi.ai changes or a docs page needs writing.
---

# delphi.ai docs

## Refresh the API reference

1. `just docs-api` regenerates `apps/delphi-docs/src/generated/api.json`
   from `~/delphi.ai`. For an unmerged branch:
   `DELPHI_REF=<branch> just docs-api`.
2. `just test` fails if a page names a model the manifest lacks, or an MDX
   link points nowhere; fix the registry or the MDX, never the test.

## Add a model page

1. The model must exist in the manifest (step above).
2. Add its entry to its section in `src/content/registry.ts`.
3. Optional prose and math: `src/content/algorithms/<slug>.mdx`. Every code
   example must be run against delphi.ai before it is published.

## Check and preview

- `just check`, then `just e2e`, then `just preview` and read the page at
  `http://localhost:8000/delphi/#/<slug>` in both themes and at phone width.
- Follow `CLAUDE.md`: file headers, named exports, no hard-coded facts that
  delphi.ai owns.
