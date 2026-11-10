# pat-styles

Shared CSS for the React apps in this repo. Each app imports it once:

```ts
import 'pat-styles';            // everything, in cascade order
// or piecemeal: 'pat-styles/tokens.css', 'pat-styles/base.css', ...
```

| File | What it holds |
|---|---|
| `tokens.css` | Colors, fonts, radii, shadows, sizes. Dracula is the default; `[data-theme="light"]` switches to Alucard. |
| `base.css` | Reset, `body`, and primitives: `.badge`, `.button`, `.card`, `.icon-button`, `.eyebrow`, `.lead`, `.muted`. |
| `shell.css` | The docs shell from `pat-components`: navbar, search, sidebar, content, "On this page", prev/next, drawer. |
| `prose.css` | Long-form content: headings, code blocks and tokens, math, tables, `.disclosure`, callouts. |

Colors come only from tokens; a component never hard-codes one. App-specific
classes live in the app, not here.
