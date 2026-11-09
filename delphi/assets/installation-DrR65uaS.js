import{g as o,j as e}from"./vendor-DgO6RGWS.js";function n(s){const t={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(t.p,{children:["delphi needs Python 3.10 to 3.14, ",e.jsx(t.a,{href:"https://python-poetry.org",children:"Poetry"}),` and
`,e.jsx(t.a,{href:"https://github.com/casey/just",children:e.jsx(t.code,{children:"just"})}),`. Neither needs a version manager such
as asdf.`]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-bash",children:`# Poetry
curl -sSL https://install.python-poetry.org | python3 -

# just, into ~/.local/bin (or: brew install just, cargo install just)
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin
`})}),`
`,e.jsx(t.p,{children:"Then clone and install delphi:"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-bash",children:`git clone https://github.com/pstefanou12/delphi.ai.git
cd delphi.ai
just install    # poetry install --with dev
just hooks      # pre-push hooks running just check
`})}),`
`,e.jsx(t.h2,{id:"development",children:"Development"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-bash",children:`just check                 # ruff format, ruff check, pylint --errors-only, mypy
just test                  # tests affected by your changes; CI runs all but slow
just test --testmon-noselect   # the full suite
just test -m "not slow"    # skip fits over a minute
just test <path> -n 0 --log-cli-level=INFO   # show training logs, serially
just cov                   # branch coverage of delphi/
`})}),`
`,e.jsxs(t.p,{children:["Next: the ",e.jsx(t.a,{href:"/quickstart",children:"Quickstart"}),"."]})]})}function r(s={}){const{wrapper:t}={...o(),...s.components};return t?e.jsx(t,{...s,children:e.jsx(n,{...s})}):n(s)}export{r as default};
