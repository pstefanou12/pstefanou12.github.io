import{g as r,j as e}from"./vendor-DgO6RGWS.js";function t(s){const n={code:"code",em:"em",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["delphi separates ",e.jsx(n.em,{children:"how a model is fit"}),", which the trainer owns, from ",e.jsx(n.em,{children:`what is
fit`}),", which each model describes."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"delphi/trainer.py"})," fits any model built on the ",e.jsx(n.code,{children:"DelphiModel"}),` base class
(`,e.jsx(n.code,{children:"delphi/delphi.py"}),"). Its one entry point, ",e.jsx(n.code,{children:"Trainer.train_model"}),`, runs a
`,e.jsx(n.strong,{children:"procedure"}),":"]}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"An optional warm start."}),` If the config sets a budget,
`,e.jsx(n.code,{children:"warm_start_iterations"})," or ",e.jsx(n.code,{children:"warm_start_epochs"}),`, the trainer first trains
the model's `,e.jsx(n.code,{children:"warm_start_criterion"}),". ",e.jsx(n.code,{children:"warm_start_"}),`-prefixed settings
override the main run's stop criteria for this stage only. Its result is
handed to the model's `,e.jsx(n.code,{children:"post_warm_start_hook"}),"."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Phases."})," Each phase trains the model's own ",e.jsx(n.code,{children:"criterion"}),` from the current
parameters, with a fresh optimizer and scheduler. After each one, the
model's `,e.jsx(n.code,{children:"post_phase_hook"}),` either stops the procedure, giving a reason, or
changes the problem for the next phase, such as widening a projection
budget. `,e.jsx(n.code,{children:"max_phases"}),` caps the number. A model that never changes its
problem keeps the default hook and trains once.`]}),`
`]}),`
`,e.jsx(n.h2,{id:"stages-and-results",children:"Stages and results"}),`
`,e.jsxs(n.p,{children:["Each run, warm start or phase, is one ",e.jsx(n.strong,{children:"stage"}),`: a config, a criterion and
that criterion's Hessian, which the Fisher learning-rate schedule sizes its
steps from. `,e.jsx(n.code,{children:"train_model"})," returns a ",e.jsx(n.code,{children:"ProcedureResult"}),` with the warm start,
the phases in order and why the procedure stopped. Each run is a `,e.jsx(n.code,{children:"RunResult"}),`
holding the config it ran under, its loss, gradient and iterate histories,
its stop reason and wall time, and any `,e.jsx(n.code,{children:"metrics"}),` the model reports through
`,e.jsx(n.code,{children:"run_metrics"}),`. The best, final, moving-average and averaged estimates are
computed from the iterates.`]}),`
`,e.jsx(n.h2,{id:"stopping",children:"Stopping"}),`
`,e.jsxs(n.p,{children:[`Within a run the trainer steps the optimizer and records every iterate. It
stops on the first of the iteration or epoch budget, the gradient or loss
tolerances, patience, or the model's own `,e.jsx(n.code,{children:"should_stop"}),"."]})]})}function o(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}export{o as default};
