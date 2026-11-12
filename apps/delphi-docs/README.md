# delphi-docs

The [delphi.ai](https://github.com/pstefanou12/delphi.ai) documentation,
served at `/delphi/`. Built with Vite, React and MDX on `pat-components` and
`pat-styles`.

```bash
just dev          # hot reload at http://localhost:5173/
just docs-api     # regenerate src/generated/api.json from ~/delphi.ai
                  # (DELPHI_AI=<path>, DELPHI_REF=<branch> for unmerged work)
```

| Path | What it holds |
|---|---|
| `src/content/registry.ts` | The navigation tree: parts, sections, pages. |
| `src/content/guides/*.mdx` | Guides. |
| `src/content/algorithms/<slug>.mdx` | Optional prose for a model page. |
| `src/generated/api.json` | The API manifest: signatures, docstrings, configs. |
| `src/components/` | Model and guide page templates, API tables. |
| `e2e/` | The Playwright smoke test of the assembled site (`just e2e`). |

**Moving to delphi.ai's manifest.** The API manifest will be produced and
committed by delphi.ai itself (`just docs-json`), with models, sections and
papers discovered from the package. This app will then pin a delphi.ai ref,
sync the manifest at build time, and derive its navigation from it; until
then `scripts/extract_api.py` and the lists in `registry.ts` stand in.
