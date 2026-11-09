import{g as r,j as e}from"./vendor-DgO6RGWS.js";function i(n){const s={annotation:"annotation",code:"code",h2:"h2",math:"math",mfrac:"mfrac",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",msup:"msup",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...r(),...n.components},{Callout:a,ResultTable:t}=s;return a||l("Callout"),t||l("ResultTable"),e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"method",children:"Method"}),`
`,e.jsxs(s.p,{children:[`When the set cannot be queried at all, a normal can still be recovered if the
set is not too complex, by the algorithm of Kontonis, Tzamos and Zampetakis
(2019). It whitens the sample, estimates the degree-`,e.jsx(s.code,{children:"degree"}),` Hermite expansion
of a function that mixes the set with the Gaussian, and minimizes a convex
objective built from it by projected L-BFGS over the whole sample (the paper
uses SGD). Leave out `,e.jsx(s.code,{children:"phi"})," to use it."]}),`
`,e.jsx(s.h2,{id:"example",children:"Example"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`import torch as ch
import torch.distributions

from delphi.truncated.distributions import truncated_multivariate_normal

ch.manual_seed(0)

# Observed only where x0 > -0.5 and x1 > -0.5; the fit is never told so.
population = torch.distributions.MultivariateNormal(ch.zeros(2), ch.eye(2)).sample(
    [50000]
)
inside = (population[:, 0] > -0.5) & (population[:, 1] > -0.5)
S = population[inside][:20000]

# The default hyperparameters: here degree 132, sized from the sample.
model = truncated_multivariate_normal.TruncatedMultivariateNormal(2)
model.fit(S)

# The set the fit implies, as a membership oracle.
recovered = model.truncation_set()
`})}),`
`,e.jsx(t,{columns:["mean","covariance"],rows:[["truth","(0, 0)","[[1, 0], [0, 1]]"],["sample mean and covariance","(0.506, 0.512)","[[0.490, 0.004], [0.004, 0.477]]"],["recovered","(−0.010, 0.069)","[[1.024, 0.036], [0.036, 0.928]]"]]}),`
`,e.jsx(s.h2,{id:"choosing-the-degree",children:"Choosing the degree"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"The degree sets the accuracy, and the sample sets the degree."}),` The
expansion of a set's indicator converges slowly, and at a fixed degree the
estimate keeps a bias that more samples do not remove; the paper's bound
shrinks as `,e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsxs(s.msup,{children:[e.jsx(s.mi,{children:"k"}),e.jsxs(s.mrow,{children:[e.jsx(s.mo,{children:"−"}),e.jsx(s.mn,{children:"1"}),e.jsx(s.mi,{mathvariant:"normal",children:"/"}),e.jsx(s.mn,{children:"4"})]})]})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k^{-1/4}"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.888em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.03148em"},children:"k"}),e.jsx(s.span,{className:"msupsub",children:e.jsx(s.span,{className:"vlist-t",children:e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.888em"},children:e.jsxs(s.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsxs(s.span,{className:"mord mtight",children:[e.jsx(s.span,{className:"mord mtight",children:"−"}),e.jsx(s.span,{className:"mord mtight",children:"1/4"})]})})]})})})})})]})]})})]})," in the degree ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"k"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.03148em"},children:"k"})]})})]}),`. Each of the basis's
`,e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mo,{fence:"true",children:"("}),e.jsxs(s.mfrac,{linethickness:"0px",children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"k"}),e.jsx(s.mo,{children:"+"}),e.jsx(s.mi,{children:"d"})]}),e.jsx(s.mi,{children:"d"})]}),e.jsx(s.mo,{fence:"true",children:")"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\binom{k + d}{d}"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1.2801em",verticalAlign:"-0.35em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mopen delimcenter",style:{top:"0em"},children:e.jsx(s.span,{className:"delimsizing size1",children:"("})}),e.jsx(s.span,{className:"mfrac",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsxs(s.span,{className:"vlist",style:{height:"0.9301em"},children:[e.jsxs(s.span,{style:{top:"-2.355em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:e.jsx(s.span,{className:"mord mathnormal mtight",children:"d"})})})]}),e.jsxs(s.span,{style:{top:"-3.144em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsxs(s.span,{className:"mord mtight",children:[e.jsx(s.span,{className:"mord mathnormal mtight",style:{marginRight:"0.03148em"},children:"k"}),e.jsx(s.span,{className:"mbin mtight",children:"+"}),e.jsx(s.span,{className:"mord mathnormal mtight",children:"d"})]})})]})]}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.345em"},children:e.jsx(s.span,{})})})]})}),e.jsx(s.span,{className:"mclose delimcenter",style:{top:"0em"},children:e.jsx(s.span,{className:"delimsizing size1",children:")"})})]})]})})]}),` coefficients is a sample mean, though, so past about one
coefficient per sample their noise outweighs the bias the degree removes.`]}),`
`,e.jsx(s.p,{children:`By default the degree is the largest whose basis has no more terms than there
are samples estimating the coefficients (half the training sample), capped at
1200:`}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"dimensions"}),e.jsx(s.th,{children:"1"}),e.jsx(s.th,{children:"2"}),e.jsx(s.th,{children:"3"}),e.jsx(s.th,{children:"4"}),e.jsx(s.th,{children:"10"})]})}),e.jsx(s.tbody,{children:e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"default degree, 20000 samples"}),e.jsx(s.td,{children:"1200"}),e.jsx(s.td,{children:"132"}),e.jsx(s.td,{children:"35"}),e.jsx(s.td,{children:"19"}),e.jsx(s.td,{children:"6"})]})})]}),`
`,e.jsxs(s.p,{children:["More data buys more degree. Any ",e.jsx(s.code,{children:"degree"}),` can be set explicitly, with a warning
when its basis outgrows the sample.`]}),`
`,e.jsx(a,{title:"Know the covariance if you can",children:e.jsxs(s.p,{children:["Passed as ",e.jsx(s.code,{children:"covariance_matrix"}),`, it whitens the sample by the truth and only
the mean is learned, which leaves less to estimate. Both estimators degrade
as the survival mass falls, which `,e.jsx(s.code,{children:"alpha"}),` does not change: here it only
sizes the region the descent is kept in.`]})})]})}function c(n={}){const{wrapper:s}={...r(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(i,{...n})}):i(n)}function l(n,s){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{c as default};
