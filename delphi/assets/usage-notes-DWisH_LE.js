import{h as t,j as e}from"./vendor-DWhQwq9v.js";function a(n){const s={a:"a",annotation:"annotation",code:"code",em:"em",h2:"h2",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",...t(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"the-truncation-set",children:"The truncation set"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"The truncation set is a plain callable."})," ",e.jsx(s.code,{children:"phi"}),` maps a batch of shape
`,e.jsx(s.code,{children:"(n, dims)"}),` to a mask over it. Anything that answers "is this point observed?"
works; there is nothing to subclass.`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"The dimension comes from the sample."})," No model takes ",e.jsx(s.code,{children:"dims"}),": ",e.jsx(s.code,{children:"fit(S)"}),`
reads it from `,e.jsx(s.code,{children:"S.shape[1]"}),`, so known parameters such as a covariance must
match the sample's width.`]}),`
`,e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:[e.jsx(s.code,{children:"phi=None"})," learns the set."]}),` Every distribution accepts it and learns the
set from the sample before fitting; see
`,e.jsx(s.a,{href:"/truncated-statistics",children:"Learning the truncation set"}),"."]}),`
`,e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:[e.jsx(s.code,{children:"alpha"})," is optional."]}),` It is the survival mass, the fraction of the
population inside the set, and it sizes the region the optimizer is kept in.
Omit it if you cannot measure it: the budget then starts at `,e.jsx(s.code,{children:"min_radius"}),` and
grows by a factor of `,e.jsx(s.code,{children:"rate"}),` per phase, while the projection still binds, up to
`,e.jsx(s.code,{children:"max_radius"}),". ",e.jsx(s.code,{children:"alpha=1"}),` is rejected: with nothing truncated there is nothing
to correct, so fit the distribution directly.`]}),`
`,e.jsx(s.h2,{id:"hyperparameters",children:"Hyperparameters"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Hyperparameters are a keyword argument."}),` Every model runs on its config's
defaults; override any of them with `,e.jsx(s.code,{children:'hyperparameters={"iterations": 5000}'}),`.
Each algorithm page lists its config's keys and defaults under
`,e.jsx(s.em,{children:"Hyperparameters"}),"."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Hyperparameters are a plain dict"}),`, validated against a pydantic config.
Keys the config does not declare are ignored with a warning, so a misspelled
key is audible rather than silent.`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"The Fisher schedule is the default."}),` It sets the step size from the
Hessian of the truncated likelihood, starting at `,e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mn,{children:"1"}),e.jsx(s.mi,{mathvariant:"normal",children:"/"}),e.jsx(s.mi,{children:"L"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"1 / L"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mord",children:"1/"}),e.jsx(s.span,{className:"mord mathnormal",children:"L"})]})})]}),` and decaying as
`,e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mn,{children:"1"}),e.jsx(s.mi,{mathvariant:"normal",children:"/"}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsx(s.mi,{children:"L"}),e.jsx(s.mo,{children:"+"}),e.jsx(s.mi,{children:"μ"}),e.jsx(s.mi,{children:"t"}),e.jsx(s.mo,{stretchy:"false",children:")"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"1 / (L + \\mu t)"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mord",children:"1/"}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsx(s.span,{className:"mord mathnormal",children:"L"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}}),e.jsx(s.span,{className:"mbin",children:"+"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mord mathnormal",children:"μ"}),e.jsx(s.span,{className:"mord mathnormal",children:"t"}),e.jsx(s.span,{className:"mclose",children:")"})]})]})]}),`, and re-measures both as the fit moves, so neither needs
tuning. Pass `,e.jsx(s.code,{children:'hyperparameters={"scheduler": None}'})," for a constant rate."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Some families precondition."}),` Families whose sufficient statistics are
strongly correlated on the truncation set, such as the inverse Gaussian's `,e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"x"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"x"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.4306em"}}),e.jsx(s.span,{className:"mord mathnormal",children:"x"})]})})]}),`
and `,e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mn,{children:"1"}),e.jsx(s.mi,{mathvariant:"normal",children:"/"}),e.jsx(s.mi,{children:"x"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"1/x"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mord",children:"1/"}),e.jsx(s.span,{className:"mord mathnormal",children:"x"})]})})]})," or the two-parameter Gamma's ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"log"}),e.jsx(s.mo,{children:"⁡"}),e.jsx(s.mi,{children:"x"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\log x"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.8889em",verticalAlign:"-0.1944em"}}),e.jsxs(s.span,{className:"mop",children:["lo",e.jsx(s.span,{style:{marginRight:"0.01389em"},children:"g"})]}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsx(s.span,{className:"mord mathnormal",children:"x"})]})})]})," and ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"x"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"x"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.4306em"}}),e.jsx(s.span,{className:"mord mathnormal",children:"x"})]})})]}),", set ",e.jsx(s.code,{children:"precondition"}),`:
each step multiplies the gradient by the inverse covariance of the sufficient
statistics over the observed sample, the truncated NLL's Hessian at the truth.`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Standardize multivariate normals first."})," Fit on ",e.jsx(s.code,{children:"(S - mean) / std"}),` with
`,e.jsx(s.code,{children:"phi"})," composed with the inverse transform, as in the ",e.jsx(s.a,{href:"/quickstart",children:"Quickstart"}),`,
and map the estimates back: the raw data's scale slows the descent.`]}),`
`,e.jsx(s.h2,{id:"estimates",children:"Estimates"}),`
`,e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:["Use the ",e.jsx(s.code,{children:"avg_"})," estimates."]})," Every model exposes four: ",e.jsx(s.code,{children:"avg_"}),` (the mean of
the iterates after a burn-in, set by `,e.jsx(s.code,{children:"avg_burn_in"}),"), ",e.jsx(s.code,{children:"ema_"}),` (a bias-corrected
moving average), `,e.jsx(s.code,{children:"final_"})," (the last iterate) and ",e.jsx(s.code,{children:"best_"}),` (the iterate with the
lowest validation loss). The averaged iterate is the one the convergence
guarantee is about; `,e.jsx(s.code,{children:"best_"})," is the least reliable of the four in our tests."]}),`
`,e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:[e.jsx(s.code,{children:"model.summary()"})," reports how the fit went"]}),`: the data and survival mass,
the optimizer, scheduler, steps, stop reason and final losses, all four
estimates, how often the projection fired, the fitted model's own mass on the
truncation set (a mismatch with `,e.jsx(s.code,{children:"alpha"}),` means the fit has gone wrong) and the
curvature at the estimate. It has no standard errors or p-values: neither
analysis this follows gives an asymptotic distribution for the estimate.
Estimates are reported in the coordinates the model was fit in, so after
standardizing, map them back as in the Quickstart.`]}),`
`,e.jsx(s.h2,{id:"logging",children:"Logging"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Logging is off until you turn it on."}),` delphi.ai logs through the standard
library under the `,e.jsx(s.code,{children:"delphi"})," logger and installs no handler:"]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`import logging

logging.basicConfig(level=logging.INFO)
logging.getLogger("delphi.trainer").setLevel(logging.WARNING)  # per module
`})})]})}function r(n={}){const{wrapper:s}={...t(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(a,{...n})}):a(n)}export{r as default};
