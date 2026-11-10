# pat-components

React components the site's apps share. Generic: nothing here knows about
delphi.ai or MMA; apps hand in their data as a typed `NavTree`.

```tsx
import 'pat-styles';
import {DocsShell, PROSE_COMPONENTS} from 'pat-components';

const tree: NavTree = {parts: [{id: 'start', title: 'Get started', sections: [...]}]};

<Route element={<DocsShell tree={tree} brand={{mark: 'δ', name: 'delphi.ai'}} repositoryUrl="..." />}>
  ...
</Route>
```

| Folder | Exports |
|---|---|
| `nav/` | `NavTree` and its lookups (`partOf`, `breadcrumb`, `neighbours`, ...), `Sidebar`, `PartTabs`, `PrevNext` |
| `shell/` | `DocsShell`: navbar, sidebar, the routed page (`<Outlet/>`), "On this page" |
| `search/` | `Search` (Ctrl+K), and its index |
| `on_this_page/` | `OnThisPage`, with optional source links |
| `theme/` | `useTheme`, `ThemeToggle`; Dracula by default, shared across apps |
| `prose/` | What MDX prose renders with: `CodeBlock`, `Callout`, `Table`, `Description`, `ResultTable`, `Tex`, `Anchor`, and `PROSE_COMPONENTS` |
| `hooks/` | `useCurrentSlug` |

Styling comes from `pat-styles`; components only set class names.
Peer dependencies: React 18, React Router 6, prism-react-renderer, KaTeX.

```bash
npm test -w pat-components        # Vitest + Testing Library
npm run typecheck -w pat-components
```
