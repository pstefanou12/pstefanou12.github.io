import{h as r,j as n}from"./vendor-DWhQwq9v.js";function t(s){const e={a:"a",annotation:"annotation",code:"code",h2:"h2",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",p:"p",pre:"pre",semantics:"semantics",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...r(),...s.components},{ResultTable:a}=e;return a||i("ResultTable"),n.jsxs(n.Fragment,{children:[n.jsx(e.h2,{id:"which-class",children:"Which class"}),`
`,n.jsxs(e.p,{children:[`The univariate normal has four classes, one for each combination of what you
know. Each takes what it needs of `,n.jsx(e.code,{children:"phi"}),", ",n.jsx(e.code,{children:"covariance_matrix"}),`
(the known variance, as a 1×1 matrix) and `,n.jsx(e.code,{children:"alpha"}),`, and reports the standard
deviation as `,n.jsx(e.code,{children:"scale_"}),", as ",n.jsx(e.code,{children:"torch.distributions.Normal"}),` names it. The API
reference below covers all four.`]}),`
`,n.jsxs(e.table,{children:[n.jsx(e.thead,{children:n.jsxs(e.tr,{children:[n.jsx(e.th,{children:"you know"}),n.jsx(e.th,{children:"class"}),n.jsx(e.th,{children:"learns"})]})}),n.jsxs(e.tbody,{children:[n.jsxs(e.tr,{children:[n.jsxs(e.td,{children:["the set (",n.jsx(e.code,{children:"phi"}),")"]}),n.jsx(e.td,{children:n.jsx(e.code,{children:"TruncatedNormal"})}),n.jsxs(e.td,{children:[n.jsx(e.code,{children:"loc_"}),", ",n.jsx(e.code,{children:"scale_"})]})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:"the set and the variance"}),n.jsx(e.td,{children:n.jsx(e.code,{children:"TruncatedNormalKnownVariance"})}),n.jsx(e.td,{children:n.jsx(e.code,{children:"loc_"})})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:"neither"}),n.jsx(e.td,{children:n.jsx(e.code,{children:"UnknownTruncationNormal"})}),n.jsxs(e.td,{children:[n.jsx(e.code,{children:"loc_"}),", ",n.jsx(e.code,{children:"scale_"})]})]}),n.jsxs(e.tr,{children:[n.jsx(e.td,{children:"the variance only"}),n.jsx(e.td,{children:n.jsx(e.code,{children:"UnknownTruncationNormalKnownVariance"})}),n.jsx(e.td,{children:n.jsx(e.code,{children:"loc_"})})]})]})]}),`
`,n.jsxs(e.p,{children:[n.jsx(e.code,{children:"TruncatedNormal(None)"}),` also works: like every family, it then learns the set
by L1 regression first; see
`,n.jsx(e.a,{href:"/truncated-statistics",children:"Learning the truncation set"}),"."]}),`
`,n.jsxs(e.p,{children:[`With a known set they fit by projected SGD on the truncated negative
log-likelihood (Daskalakis et al., 2018); with an unknown one, from the
sample's Hermite expansion (Kontonis, Tzamos and Zampetakis, 2019). The
`,n.jsx(e.a,{href:"/truncated-multivariate-normal",children:"multivariate normal"}),` page describes both
methods, with examples.`]}),`
`,n.jsx(e.h2,{id:"example",children:"Example"}),`
`,n.jsxs(e.p,{children:["A normal with mean 1 and standard deviation 2, observed only where ",n.jsxs(e.span,{className:"katex",children:[n.jsx(e.span,{className:"katex-mathml",children:n.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:n.jsxs(e.semantics,{children:[n.jsxs(e.mrow,{children:[n.jsx(e.mi,{children:"x"}),n.jsx(e.mo,{children:">"}),n.jsx(e.mn,{children:"0"})]}),n.jsx(e.annotation,{encoding:"application/x-tex",children:"x > 0"})]})})}),n.jsxs(e.span,{className:"katex-html","aria-hidden":"true",children:[n.jsxs(e.span,{className:"base",children:[n.jsx(e.span,{className:"strut",style:{height:"0.5782em",verticalAlign:"-0.0391em"}}),n.jsx(e.span,{className:"mord mathnormal",children:"x"}),n.jsx(e.span,{className:"mspace",style:{marginRight:"0.2778em"}}),n.jsx(e.span,{className:"mrel",children:">"}),n.jsx(e.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),n.jsxs(e.span,{className:"base",children:[n.jsx(e.span,{className:"strut",style:{height:"0.6444em"}}),n.jsx(e.span,{className:"mord",children:"0"})]})]})]}),":"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-python",children:`import torch as ch

from delphi.truncated.distributions import truncated_normal

ch.manual_seed(0)

population = ch.randn(50000, 1) * 2.0 + 1.0


def phi(x):
    return (x > 0.0).squeeze(-1)


S = population[phi(population)]
alpha = phi(population).float().mean().item()

# Fit on standardized data, moving phi through the same transform.
mean, std = S.mean(0), S.std(0)
model = truncated_normal.TruncatedNormal(
    lambda z: phi(z * std + mean), alpha=alpha
)
model.fit((S - mean) / std)

recovered_loc = model.avg_loc_ * std + mean
recovered_scale = model.avg_scale_ * std
`})}),`
`,n.jsx(a,{columns:["loc","scale"],rows:[["truth","1","2"],["sample mean and standard deviation","2.010","1.390"],["recovered","1.011","1.978"]]})]})}function d(s={}){const{wrapper:e}={...r(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(t,{...s})}):t(s)}function i(s,e){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as default};
