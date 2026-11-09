import{h as i,j as e}from"./vendor-DWhQwq9v.js";function t(n){const s={a:"a",annotation:"annotation",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",math:"math",mi:"mi",mo:"mo",mrow:"mrow",msub:"msub",ol:"ol",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...i(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsxs(s.p,{children:[`A new model joins delphi.ai as a module, a config, tests and a page on this site,
reviewed through a pull request against `,e.jsx(s.code,{children:"master"}),`. This page covers what each
needs. The full style rules are in delphi.ai's
`,e.jsx(s.a,{href:"https://github.com/pstefanou12/delphi.ai/blob/master/CLAUDE.md",children:"CLAUDE.md"}),"."]}),`
`,e.jsx(s.h2,{id:"what-a-model-needs",children:"What a model needs"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"A module."}),` Models live by area: truncated distributions in
`,e.jsx(s.code,{children:"delphi/truncated/distributions/"}),`, truncated regression and classification in
`,e.jsx(s.code,{children:"delphi/stats/truncated/"}),`. One model per module, named after it
(`,e.jsx(s.code,{children:"truncated_poisson.py"})," holds ",e.jsx(s.code,{children:"TruncatedPoisson"}),")."]}),`
`,e.jsxs(s.p,{children:[e.jsxs(s.strong,{children:["A ",e.jsx(s.code,{children:"DelphiModel"})," subclass."]})," The ",e.jsx(s.a,{href:"/trainer",children:"trainer"}),` fits every model, so a
model describes `,e.jsx(s.em,{children:"what"})," is fit and leaves ",e.jsx(s.em,{children:"how"}),` to the trainer. It supplies its
config class as `,e.jsx(s.code,{children:"defaults"}),", its loss as ",e.jsx(s.code,{children:"criterion"}),`, the loss's curvature as
`,e.jsx(s.code,{children:"hessian()"}),` for the Fisher schedule, and whichever hooks it needs; see
`,e.jsx(s.a,{href:"/models",children:"Models"})," for the full list and the base classes to build on."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"A config."})," Hyperparameters are a pydantic config under ",e.jsx(s.code,{children:"delphi/configs/"}),`,
subclassing the nearest existing one. Document every field in the class
docstring's `,e.jsx(s.code,{children:"Attributes:"}),` section: this site's hyperparameter tables are
generated from it.`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Its estimates."})," Name them as ",e.jsx(s.code,{children:"torch.distributions"}),` names the parameters
(`,e.jsx(s.code,{children:"rate_"}),", ",e.jsx(s.code,{children:"loc_"}),", ",e.jsx(s.code,{children:"covariance_matrix_"}),`) and expose all four variants:
`,e.jsx(s.code,{children:"avg_"}),", ",e.jsx(s.code,{children:"ema_"}),", ",e.jsx(s.code,{children:"final_"})," and ",e.jsx(s.code,{children:"best_"}),`. Declare the suffixes in
`,e.jsx(s.code,{children:"estimate_suffixes"}),"."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"A starting point."}),` If the untruncated MLE has a closed form, the model
starts from it. If not, it starts from a rough estimate and enables the warm
start (`,e.jsx(s.code,{children:"WarmStartedExponentialFamilyDistributionConfig"}),` for a distribution),
which refines that start to the untruncated MLE.`]}),`
`,e.jsx(s.h3,{id:"a-new-distribution",children:"A new distribution"}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Write the family class"})," in ",e.jsx(s.code,{children:"delphi/exponential_family/"}),`: its sufficient
statistic, `,e.jsx(s.code,{children:"to_natural"}),", ",e.jsx(s.code,{children:"to_canonical"})," and ",e.jsx(s.code,{children:"log_prob"}),`. Check that
`,e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mo,{stretchy:"false",children:"⟨"}),e.jsx(s.mi,{children:"T"}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsx(s.mi,{children:"x"}),e.jsx(s.mo,{stretchy:"false",children:")"}),e.jsx(s.mo,{separator:"true",children:","}),e.jsx(s.mi,{children:"θ"}),e.jsx(s.mo,{stretchy:"false",children:"⟩"}),e.jsx(s.mo,{children:"+"}),e.jsx(s.mi,{children:"log"}),e.jsx(s.mo,{children:"⁡"}),e.jsx(s.mi,{children:"h"}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsx(s.mi,{children:"x"}),e.jsx(s.mo,{stretchy:"false",children:")"}),e.jsx(s.mo,{children:"−"}),e.jsx(s.mi,{children:"log"}),e.jsx(s.mo,{children:"⁡"}),e.jsxs(s.msub,{children:[e.jsx(s.mi,{children:"p"}),e.jsx(s.mi,{children:"θ"})]}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsx(s.mi,{children:"x"}),e.jsx(s.mo,{stretchy:"false",children:")"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\langle T(x), \\theta \\rangle + \\log h(x) - \\log p_\\theta(x)"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mopen",children:"⟨"}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.13889em"},children:"T"}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsx(s.span,{className:"mord mathnormal",children:"x"}),e.jsx(s.span,{className:"mclose",children:")"}),e.jsx(s.span,{className:"mpunct",children:","}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.02778em"},children:"θ"}),e.jsx(s.span,{className:"mclose",children:"⟩"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}}),e.jsx(s.span,{className:"mbin",children:"+"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsxs(s.span,{className:"mop",children:["lo",e.jsx(s.span,{style:{marginRight:"0.01389em"},children:"g"})]}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsx(s.span,{className:"mord mathnormal",children:"h"}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsx(s.span,{className:"mord mathnormal",children:"x"}),e.jsx(s.span,{className:"mclose",children:")"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}}),e.jsx(s.span,{className:"mbin",children:"−"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsxs(s.span,{className:"mop",children:["lo",e.jsx(s.span,{style:{marginRight:"0.01389em"},children:"g"})]}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord mathnormal",children:"p"}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.3361em"},children:e.jsxs(s.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mathnormal mtight",style:{marginRight:"0.02778em"},children:"θ"})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(s.span,{})})})]})})]}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsx(s.span,{className:"mord mathnormal",children:"x"}),e.jsx(s.span,{className:"mclose",children:")"})]})]})]}),` is constant
across samples.`]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Write the truncated model"})," in ",e.jsx(s.code,{children:"delphi/truncated/distributions/"}),`,
subclassing `,e.jsx(s.code,{children:"TruncatedExponentialFamilyDistribution"}),`, which supplies the
truncated NLL, its Hessian, the projection and the phases. The family adds
`,e.jsx(s.code,{children:"_calc_emp_model"})," (the start), ",e.jsx(s.code,{children:"_constraints"}),` (the parameter domain) and
its estimates.`]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Test it"})," with ",e.jsx(s.code,{children:"helpers.assert_family_recovers"}),` and
`,e.jsx(s.code,{children:"helpers.assert_family_distinguishes"}),`, as the existing
`,e.jsx(s.code,{children:"truncated_*_test.py"})," modules do."]}),`
`]}),`
`,e.jsx(s.h2,{id:"tests",children:"Tests"}),`
`,e.jsxs(s.p,{children:["Tests live in a ",e.jsx(s.code,{children:"tests/"}),` package beside the code they cover, one
`,e.jsx(s.code,{children:"<module>_test.py"}),` per module. A model's tests should show that it recovers
known parameters from a truncated sample, and that its estimates beat the
naive fit to the same sample. Mark a fit that takes over a minute
`,e.jsx(s.code,{children:"@pytest.mark.slow"}),": CI skips it, so run it locally before asking for review."]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-bash",children:`just test <changed test files> -m "not slow"   # what changed, fast
just test <changed test files>                 # including the slow fits
`})}),`
`,e.jsx(s.h2,{id:"code-style",children:"Code style"}),`
`,e.jsxs(s.p,{children:["delphi.ai follows the ",e.jsx(s.a,{href:"https://google.github.io/styleguide/pyguide.html",children:"Google Python Style Guide"}),`,
with these house rules:`]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Imports"}),`: absolute only. Import modules, not names from them
(`,e.jsx(s.code,{children:"from delphi.stats.truncated import truncated_linear_regression"}),`), except
a class used directly as a base class. Package `,e.jsx(s.code,{children:"__init__.py"}),` files import
nothing.`]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Every file"})," starts with an author comment, ",e.jsx(s.code,{children:"# Author: githubhandle@"}),`,
before the module docstring.`]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Docstrings"}),` on every public module, class and function, Google style
(`,e.jsx(s.code,{children:"Args:"}),", ",e.jsx(s.code,{children:"Returns:"}),", ",e.jsx(s.code,{children:"Raises:"}),", ",e.jsx(s.code,{children:"Attributes:"}),`), with a one-line summary
under 80 characters.`]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Types"}),": annotate every public signature; write ",e.jsx(s.code,{children:"Optional[X]"}),`, not
`,e.jsx(s.code,{children:"X | None"}),"."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Tensors"}),": build them with ",e.jsx(s.code,{children:"ch.tensor(...)"}),`, never the legacy
`,e.jsx(s.code,{children:"ch.Tensor(...)"})," constructor; the lint check rejects it."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Comments"})," say why, not what, in a line or two."]}),`
`]}),`
`,e.jsx(s.h2,{id:"checks",children:"Checks"}),`
`,e.jsxs(s.p,{children:["Install the pre-push hooks once with ",e.jsx(s.code,{children:"just hooks"}),`. On every push they run the
static checks on the pushed files. Locally, check only what changed:`]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-bash",children:`just fmt && just lint
poetry run pylint --errors-only <changed files>
poetry run mypy <changed files>
just test <changed test files> -m "not slow"
`})}),`
`,e.jsxs(s.p,{children:["Run the full suite with ",e.jsx(s.code,{children:"just test"}),` when the change reaches code many models
depend on: `,e.jsx(s.code,{children:"delphi/delphi.py"}),", ",e.jsx(s.code,{children:"delphi/trainer.py"}),", ",e.jsx(s.code,{children:"delphi/configs/base.py"}),`, a
base model or distribution class, or a shared test helper.`]}),`
`,e.jsx(s.h2,{id:"review",children:"Review"}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Branch and open a pull request"})," against ",e.jsx(s.code,{children:"master"}),`, describing the model,
the paper it implements, and what the tests show.`]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"CI must pass."})," It runs ",e.jsx(s.code,{children:"just check"}),` (ruff format, ruff, pylint and mypy
over the whole package) and the test suite, minus the slow fits, in four
parallel groups.`]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"A maintainer reviews"}),` the model against this page: its place in the
package, its config and estimates, its tests, and the style above.`]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Document it here."})," Add the class to ",e.jsx(s.code,{children:"MODELS"}),` in this site's
`,e.jsx(s.code,{children:"delphi/scripts/extract_api.py"}),`, regenerate the reference with
`,e.jsx(s.code,{children:"npm run docs:api"}),`, and add an entry to its section in
`,e.jsx(s.code,{children:"delphi/web/src/content/registry.ts"}),`. The page then exists, built from
your docstrings; prose and math go in
`,e.jsx(s.code,{children:"delphi/web/src/content/algorithms/<slug>.mdx"}),`. Cite the paper it
implements in the entry's `,e.jsx(s.code,{children:"papers"}),"."]}),`
`]})]})}function l(n={}){const{wrapper:s}={...i(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(t,{...n})}):t(n)}export{l as default};
