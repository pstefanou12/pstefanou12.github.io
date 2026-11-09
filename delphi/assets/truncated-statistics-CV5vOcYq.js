import{h as i,j as s}from"./vendor-DWhQwq9v.js";function a(n){const e={a:"a",annotation:"annotation",code:"code",h2:"h2",li:"li",math:"math",mfrac:"mfrac",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",msup:"msup",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...i(),...n.components};return s.jsxs(s.Fragment,{children:[s.jsxs(e.p,{children:["A sample is ",s.jsx(e.strong,{children:"truncated"})," when every observation outside some set ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsx(e.mrow,{children:s.jsx(e.mi,{children:"S"})}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"S"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.6833em"}}),s.jsx(e.span,{className:"mord mathnormal",style:{marginRight:"0.05764em"},children:"S"})]})})]}),` is
missing entirely: not recorded as missing, just absent. What remains is a
biased view of the distribution that produced it, and statistics computed on
it, from a mean to a least-squares fit, are biased toward `,s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsx(e.mrow,{children:s.jsx(e.mi,{children:"S"})}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"S"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.6833em"}}),s.jsx(e.span,{className:"mord mathnormal",style:{marginRight:"0.05764em"},children:"S"})]})})]}),"."]}),`
`,s.jsxs(e.p,{children:[`delphi.ai's truncated models recover the distribution or model as it was
before truncation. They work best with a `,s.jsx(e.strong,{children:"membership oracle"}),` for the set: a
plain callable `,s.jsx(e.code,{children:"phi"}),` that answers "is this point observed?" for a batch of
points. When the set cannot be queried at all, every distribution can learn
it from the sample instead: pass `,s.jsx(e.code,{children:"phi=None"}),"."]}),`
`,s.jsx(e.h2,{id:"what-is-covered",children:"What is covered"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.strong,{children:"Distributions"}),": the ",s.jsx(e.a,{href:"/truncated-multivariate-normal",children:"normal"}),` and 30
other exponential families, continuous, discrete, simplex and
matrix-valued, each with a known or a learned truncation set, fit by
projected SGD on the truncated negative log-likelihood.`]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.strong,{children:"Regression"}),": ",s.jsx(e.a,{href:"/truncated-linear-regression",children:"linear"}),`, with known or
unknown noise variance or dependent data, and `,s.jsx(e.a,{href:"/truncated-lasso-regression",children:"sparse"}),"."]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.strong,{children:"Classification"}),": ",s.jsx(e.a,{href:"/truncated-probit-regression",children:"probit"}),`,
`,s.jsx(e.a,{href:"/truncated-logistic-regression",children:"logistic"}),` and
`,s.jsx(e.a,{href:"/truncated-multinomial-logistic-regression",children:"multinomial logistic"}),`
regression, truncated on the latent.`]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.strong,{children:"Dynamical systems"}),": a ",s.jsx(e.a,{href:"/truncated-lqr",children:"linear quadratic regulator"}),"."]}),`
`]}),`
`,s.jsx(e.h2,{id:"learning-the-truncation-set",children:"Learning the truncation set"}),`
`,s.jsxs(e.p,{children:["Every distribution also accepts ",s.jsx(e.code,{children:"phi=None"}),`. It then learns the set first,
following Lee, Mehrotra and Zampetakis (2024): the sample, labeled 1, is mixed
with draws from the family's untruncated fit to it, labeled 0 at weight
`,s.jsx(e.code,{children:"truncation_set_rho"}),`, and a polynomial threshold of degree
`,s.jsx(e.code,{children:"truncation_set_degree"}),` is fit to the labels by L1 regression. The family then
fits the samples inside the learned set by the same procedure as with a known
`,s.jsx(e.code,{children:"phi"}),". Heavy-tailed families learn the set in ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsxs(e.mrow,{children:[s.jsx(e.mi,{children:"log"}),s.jsx(e.mo,{children:"⁡"}),s.jsx(e.mi,{children:"x"})]}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"\\log x"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.8889em",verticalAlign:"-0.1944em"}}),s.jsxs(e.span,{className:"mop",children:["lo",s.jsx(e.span,{style:{marginRight:"0.01389em"},children:"g"})]}),s.jsx(e.span,{className:"mspace",style:{marginRight:"0.1667em"}}),s.jsx(e.span,{className:"mord mathnormal",children:"x"})]})})]}),"."]}),`
`,s.jsxs(e.p,{children:["The basis has ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsxs(e.mrow,{children:[s.jsx(e.mo,{fence:"true",children:"("}),s.jsxs(e.mfrac,{linethickness:"0px",children:[s.jsxs(e.mrow,{children:[s.jsx(e.mi,{children:"k"}),s.jsx(e.mo,{children:"+"}),s.jsx(e.mi,{children:"d"})]}),s.jsx(e.mi,{children:"d"})]}),s.jsx(e.mo,{fence:"true",children:")"})]}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"\\binom{k + d}{d}"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"1.2801em",verticalAlign:"-0.35em"}}),s.jsxs(e.span,{className:"mord",children:[s.jsx(e.span,{className:"mopen delimcenter",style:{top:"0em"},children:s.jsx(e.span,{className:"delimsizing size1",children:"("})}),s.jsx(e.span,{className:"mfrac",children:s.jsxs(e.span,{className:"vlist-t vlist-t2",children:[s.jsxs(e.span,{className:"vlist-r",children:[s.jsxs(e.span,{className:"vlist",style:{height:"0.9301em"},children:[s.jsxs(e.span,{style:{top:"-2.355em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"2.7em"}}),s.jsx(e.span,{className:"sizing reset-size6 size3 mtight",children:s.jsx(e.span,{className:"mord mtight",children:s.jsx(e.span,{className:"mord mathnormal mtight",children:"d"})})})]}),s.jsxs(e.span,{style:{top:"-3.144em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"2.7em"}}),s.jsx(e.span,{className:"sizing reset-size6 size3 mtight",children:s.jsxs(e.span,{className:"mord mtight",children:[s.jsx(e.span,{className:"mord mathnormal mtight",style:{marginRight:"0.03148em"},children:"k"}),s.jsx(e.span,{className:"mbin mtight",children:"+"}),s.jsx(e.span,{className:"mord mathnormal mtight",children:"d"})]})})]})]}),s.jsx(e.span,{className:"vlist-s",children:"​"})]}),s.jsx(e.span,{className:"vlist-r",children:s.jsx(e.span,{className:"vlist",style:{height:"0.345em"},children:s.jsx(e.span,{})})})]})}),s.jsx(e.span,{className:"mclose delimcenter",style:{top:"0em"},children:s.jsx(e.span,{className:"delimsizing size1",children:")"})})]})]})})]}),` terms, so unless set the degree is the
largest up to 4 whose basis has at most 250 terms: 4 up to 6 dimensions, 3 up
to 9, 2 up to 20, and 1 beyond. A family whose samples satisfy a polynomial
identity, such as the Dirichlet's coordinates summing to one or a Bernoulli's
`,s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsxs(e.mrow,{children:[s.jsxs(e.msup,{children:[s.jsx(e.mi,{children:"x"}),s.jsx(e.mn,{children:"2"})]}),s.jsx(e.mo,{children:"="}),s.jsx(e.mi,{children:"x"})]}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"x^2 = x"})]})})}),s.jsxs(e.span,{className:"katex-html","aria-hidden":"true",children:[s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.8141em"}}),s.jsxs(e.span,{className:"mord",children:[s.jsx(e.span,{className:"mord mathnormal",children:"x"}),s.jsx(e.span,{className:"msupsub",children:s.jsx(e.span,{className:"vlist-t",children:s.jsx(e.span,{className:"vlist-r",children:s.jsx(e.span,{className:"vlist",style:{height:"0.8141em"},children:s.jsxs(e.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"2.7em"}}),s.jsx(e.span,{className:"sizing reset-size6 size3 mtight",children:s.jsx(e.span,{className:"mord mtight",children:"2"})})]})})})})})]}),s.jsx(e.span,{className:"mspace",style:{marginRight:"0.2778em"}}),s.jsx(e.span,{className:"mrel",children:"="}),s.jsx(e.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.4306em"}}),s.jsx(e.span,{className:"mord mathnormal",children:"x"})]})]})]}),", raises a ",s.jsx(e.code,{children:"ValueError"})," naming the degree."]}),`
`,s.jsx(e.pre,{children:s.jsx(e.code,{className:"language-python",children:`import torch as ch
import torch.distributions

from delphi.truncated.distributions import truncated_exponential

ch.manual_seed(0)

# Observed only above 1; the fit is never told so.
population = torch.distributions.Exponential(ch.tensor([1.0])).sample([20000])
S = population[population[:, 0] > 1.0][:5000]

model = truncated_exponential.TruncatedExponential(None)
model.fit(S)

rate = model.avg_rate_
# The learned set, as a membership oracle.
inside = model.truncation_set_(ch.tensor([[0.5], [2.0]]))
`})}),`
`,s.jsxs(e.p,{children:["The ",s.jsx(e.a,{href:"/truncated-multivariate-normal",children:"normal"}),` has a second route for an
unknown set, the Hermite expansion of Kontonis, Tzamos and Zampetakis (2019),
which is its default; `,s.jsx(e.code,{children:'method="l1"'})," selects the route above instead."]}),`
`,s.jsx(e.h2,{id:"where-next",children:"Where next"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.a,{href:"/usage-notes",children:"Usage notes"}),": ",s.jsx(e.code,{children:"phi"}),", ",s.jsx(e.code,{children:"alpha"}),`, hyperparameters and which
estimate to read.`]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.a,{href:"/quickstart",children:"Quickstart"}),": a correlated Gaussian seen only on a half-plane."]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.a,{href:"/adding-a-model",children:"Adding a model"}),`: what a new model needs and how it is
reviewed.`]}),`
`]})]})}function r(n={}){const{wrapper:e}={...i(),...n.components};return e?s.jsx(e,{...n,children:s.jsx(a,{...n})}):a(n)}export{r as default};
