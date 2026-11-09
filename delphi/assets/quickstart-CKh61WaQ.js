import{h as i,j as s}from"./vendor-DWhQwq9v.js";function t(n){const e={a:"a",annotation:"annotation",code:"code",h2:"h2",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",msub:"msub",p:"p",pre:"pre",semantics:"semantics",span:"span",ul:"ul",...i(),...n.components},{ResultTable:a}=e;return a||r("ResultTable"),s.jsxs(s.Fragment,{children:[s.jsxs(e.p,{children:["A correlated Gaussian, observed only where ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsxs(e.mrow,{children:[s.jsxs(e.msub,{children:[s.jsx(e.mi,{children:"x"}),s.jsx(e.mn,{children:"0"})]}),s.jsx(e.mo,{children:"+"}),s.jsxs(e.msub,{children:[s.jsx(e.mi,{children:"x"}),s.jsx(e.mn,{children:"1"})]}),s.jsx(e.mo,{children:">"}),s.jsx(e.mn,{children:"1"})]}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"x_0 + x_1 > 1"})]})})}),s.jsxs(e.span,{className:"katex-html","aria-hidden":"true",children:[s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.7333em",verticalAlign:"-0.15em"}}),s.jsxs(e.span,{className:"mord",children:[s.jsx(e.span,{className:"mord mathnormal",children:"x"}),s.jsx(e.span,{className:"msupsub",children:s.jsxs(e.span,{className:"vlist-t vlist-t2",children:[s.jsxs(e.span,{className:"vlist-r",children:[s.jsx(e.span,{className:"vlist",style:{height:"0.3011em"},children:s.jsxs(e.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"2.7em"}}),s.jsx(e.span,{className:"sizing reset-size6 size3 mtight",children:s.jsx(e.span,{className:"mord mtight",children:"0"})})]})}),s.jsx(e.span,{className:"vlist-s",children:"​"})]}),s.jsx(e.span,{className:"vlist-r",children:s.jsx(e.span,{className:"vlist",style:{height:"0.15em"},children:s.jsx(e.span,{})})})]})})]}),s.jsx(e.span,{className:"mspace",style:{marginRight:"0.2222em"}}),s.jsx(e.span,{className:"mbin",children:"+"}),s.jsx(e.span,{className:"mspace",style:{marginRight:"0.2222em"}})]}),s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.6891em",verticalAlign:"-0.15em"}}),s.jsxs(e.span,{className:"mord",children:[s.jsx(e.span,{className:"mord mathnormal",children:"x"}),s.jsx(e.span,{className:"msupsub",children:s.jsxs(e.span,{className:"vlist-t vlist-t2",children:[s.jsxs(e.span,{className:"vlist-r",children:[s.jsx(e.span,{className:"vlist",style:{height:"0.3011em"},children:s.jsxs(e.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"2.7em"}}),s.jsx(e.span,{className:"sizing reset-size6 size3 mtight",children:s.jsx(e.span,{className:"mord mtight",children:"1"})})]})}),s.jsx(e.span,{className:"vlist-s",children:"​"})]}),s.jsx(e.span,{className:"vlist-r",children:s.jsx(e.span,{className:"vlist",style:{height:"0.15em"},children:s.jsx(e.span,{})})})]})})]}),s.jsx(e.span,{className:"mspace",style:{marginRight:"0.2778em"}}),s.jsx(e.span,{className:"mrel",children:">"}),s.jsx(e.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.6444em"}}),s.jsx(e.span,{className:"mord",children:"1"})]})]})]}),`. Every model in
delphi.ai follows the same three steps: describe the truncation set as a plain
callable `,s.jsx(e.code,{children:"phi"}),", construct the model, and ",s.jsx(e.code,{children:"fit"})," it to the sample you observed."]}),`
`,s.jsx(e.pre,{children:s.jsx(e.code,{className:"language-python",children:`import torch as ch
import torch.distributions

from delphi.truncated.distributions import truncated_multivariate_normal

ch.manual_seed(0)

# Ground truth: a correlated 2-D Gaussian.
loc = ch.tensor([0.0, 0.0])
covariance_matrix = ch.tensor([[1.0, 0.5], [0.5, 1.0]])
population = torch.distributions.MultivariateNormal(loc, covariance_matrix).sample(
    [100000]
)


# The truncation set: only points with x0 + x1 > 1 are ever observed.
def phi(x):
    return x.sum(dim=-1) > 1.0


S = population[phi(population)][:10000]
alpha = phi(population).float().mean().item()

# Fit on standardized data, moving phi through the same transform.
mean, std = S.mean(0), S.std(0)
# The default hyperparameters: 2500 steps, lr 1e-2, the Fisher schedule.
model = truncated_multivariate_normal.TruncatedMultivariateNormal(
    phi=lambda z: phi(z * std + mean), alpha=alpha
)
model.fit((S - mean) / std)

# Undo the transform on the way out.
recovered_loc = model.avg_loc_ * std + mean
recovered_cov = ch.diag(std) @ model.avg_covariance_matrix_ @ ch.diag(std)
`})}),`
`,s.jsx(a,{columns:["mean","covariance"],rows:[["truth","(0, 0)","[[1, 0.5], [0.5, 1]]"],["sample mean and covariance","(1.042, 1.041)","[[0.447, −0.053], [−0.053, 0.436]]"],["recovered","(0.015, 0.047)","[[1.016, 0.491], [0.491, 0.963]]"]]}),`
`,s.jsx(e.p,{children:`28% of the population survives. The sample's own statistics are off in every
entry, and even get the sign of the correlation wrong.`}),`
`,s.jsx(e.h2,{id:"where-next",children:"Where next"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.a,{href:"/usage-notes",children:"Usage notes"}),": what ",s.jsx(e.code,{children:"phi"}),", ",s.jsx(e.code,{children:"alpha"})," and the hyperparameters do, and which estimate to read."]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.a,{href:"/truncated-multivariate-normal",children:"Multivariate normal"}),": the model above in full."]}),`
`,s.jsxs(e.li,{children:["The same page covers the fit when ",s.jsx(e.code,{children:"phi"})," cannot be queried: leave it out."]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.a,{href:"/truncated-linear-regression",children:"Linear regression"}),": truncation on the response of a linear model."]}),`
`]})]})}function c(n={}){const{wrapper:e}={...i(),...n.components};return e?s.jsx(e,{...n,children:s.jsx(t,{...n})}):t(n)}function r(n,e){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{c as default};
