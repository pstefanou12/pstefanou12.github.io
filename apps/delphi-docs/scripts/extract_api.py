"""Dump the public API of the delphi package to JSON for the docs site.

Run inside delphi.ai's environment:

    cd ~/delphi.ai && poetry run python \
        ~/pstefanou12.github.io/delphi/scripts/extract_api.py \
        --out ~/pstefanou12.github.io/delphi/web/src/generated/api.json \
        [--ref waterboi/infer-dims]

With --ref, the package is read from that git ref of the delphi.ai checkout
the environment belongs to, exported to a temporary directory, so an unmerged
branch can be documented without checking it out.

For every documented model this records the constructor signature, the
per-argument descriptions from its Google-style docstring, the class
docstring, the estimate suffixes and the fields of its pydantic config,
described from the config classes' ``Attributes:`` sections. A model that
cannot be imported fails the run, so the docs never drift silently.
"""

import argparse
import importlib
import inspect
from importlib import metadata
import json
import pathlib
import re
import subprocess
import sys
import tempfile

# (key, module, class, config override). The key is what the docs registry
# refers to. A config override names "module:Class" for models without a
# ``defaults`` attribute, such as the TruncatedMultivariateNormal dispatcher.
_DIST = "delphi.truncated.distributions"
_STATS = "delphi.stats.truncated"
_KNOWN_MVN = (
    f"{_DIST}.known_truncated_multivariate_normal:KnownTruncationMultivariateNormal"
)
_UNKNOWN_MVN = (
    f"{_DIST}.unknown_truncated_multivariate_normal:UnknownTruncationMultivariateNormal"
)

MODELS = [
    (
        "TruncatedMultivariateNormal",
        f"{_DIST}.truncated_multivariate_normal",
        "TruncatedMultivariateNormal",
        _KNOWN_MVN,
    ),
    ("TruncatedNormal", f"{_DIST}.truncated_normal", "TruncatedNormal", None),
    (
        "TruncatedNormalKnownVariance",
        f"{_DIST}.truncated_normal_known_variance",
        "TruncatedNormalKnownVariance",
        None,
    ),
    (
        "TruncatedExponential",
        f"{_DIST}.truncated_exponential",
        "TruncatedExponential",
        None,
    ),
    ("TruncatedPoisson", f"{_DIST}.truncated_poisson", "TruncatedPoisson", None),
    ("TruncatedWeibull", f"{_DIST}.truncated_weibull", "TruncatedWeibull", None),
    (
        "TruncatedBooleanProduct",
        f"{_DIST}.truncated_boolean_product",
        "TruncatedBooleanProduct",
        None,
    ),
    ("TruncatedGamma", f"{_DIST}.truncated_gamma", "TruncatedGamma", None),
    ("TruncatedPareto", f"{_DIST}.truncated_pareto", "TruncatedPareto", None),
    ("TruncatedBeta", f"{_DIST}.truncated_beta", "TruncatedBeta", None),
    ("TruncatedLogNormal", f"{_DIST}.truncated_log_normal", "TruncatedLogNormal", None),
    ("TruncatedBinomial", f"{_DIST}.truncated_binomial", "TruncatedBinomial", None),
    ("TruncatedGeometric", f"{_DIST}.truncated_geometric", "TruncatedGeometric", None),
    (
        "TruncatedNegativeBinomial",
        f"{_DIST}.truncated_negative_binomial",
        "TruncatedNegativeBinomial",
        None,
    ),
    ("TruncatedLaplace", f"{_DIST}.truncated_laplace", "TruncatedLaplace", None),
    ("TruncatedChi2", f"{_DIST}.truncated_chi2", "TruncatedChi2", None),
    (
        "TruncatedContinuousBernoulli",
        f"{_DIST}.truncated_continuous_bernoulli",
        "TruncatedContinuousBernoulli",
        None,
    ),
    ("TruncatedVonMises", f"{_DIST}.truncated_von_mises", "TruncatedVonMises", None),
    ("TruncatedDirichlet", f"{_DIST}.truncated_dirichlet", "TruncatedDirichlet", None),
    (
        "TruncatedHalfNormal",
        f"{_DIST}.truncated_half_normal",
        "TruncatedHalfNormal",
        None,
    ),
    (
        "TruncatedInverseGamma",
        f"{_DIST}.truncated_inverse_gamma",
        "TruncatedInverseGamma",
        None,
    ),
    (
        "TruncatedMultinomial",
        f"{_DIST}.truncated_multinomial",
        "TruncatedMultinomial",
        None,
    ),
    ("TruncatedRayleigh", f"{_DIST}.truncated_rayleigh", "TruncatedRayleigh", None),
    (
        "TruncatedInverseGaussian",
        f"{_DIST}.truncated_inverse_gaussian",
        "TruncatedInverseGaussian",
        None,
    ),
    (
        "TruncatedGammaUnknownConcentration",
        f"{_DIST}.truncated_gamma_unknown_concentration",
        "TruncatedGammaUnknownConcentration",
        None,
    ),
    ("TruncatedWishart", f"{_DIST}.truncated_wishart", "TruncatedWishart", None),
    ("TruncatedMaxwell", f"{_DIST}.truncated_maxwell", "TruncatedMaxwell", None),
    ("TruncatedGumbel", f"{_DIST}.truncated_gumbel", "TruncatedGumbel", None),
    ("TruncatedLevy", f"{_DIST}.truncated_levy", "TruncatedLevy", None),
    (
        "TruncatedLogarithmic",
        f"{_DIST}.truncated_logarithmic",
        "TruncatedLogarithmic",
        None,
    ),
    ("TruncatedBetaPrime", f"{_DIST}.truncated_beta_prime", "TruncatedBetaPrime", None),
    (
        "TruncatedInverseGammaUnknownConcentration",
        f"{_DIST}.truncated_inverse_gamma_unknown_concentration",
        "TruncatedInverseGammaUnknownConcentration",
        None,
    ),
    (
        "TruncatedInverseWishart",
        f"{_DIST}.truncated_inverse_wishart",
        "TruncatedInverseWishart",
        None,
    ),
    # Unknown truncation.
    (
        "TruncatedMultivariateNormal:unknown",
        f"{_DIST}.truncated_multivariate_normal",
        "TruncatedMultivariateNormal",
        _UNKNOWN_MVN,
    ),
    (
        "UnknownTruncationNormal",
        f"{_DIST}.unknown_truncated_normal",
        "UnknownTruncationNormal",
        None,
    ),
    (
        "UnknownTruncationNormalKnownVariance",
        f"{_DIST}.unknown_truncated_normal_known_variance",
        "UnknownTruncationNormalKnownVariance",
        None,
    ),
    # Regression, classification and control.
    (
        "TruncatedLinearRegression",
        f"{_STATS}.truncated_linear_regression",
        "TruncatedLinearRegression",
        None,
    ),
    (
        "TruncatedLassoRegression",
        f"{_STATS}.truncated_lasso_regression",
        "TruncatedLassoRegression",
        None,
    ),
    (
        "TruncatedProbitRegression",
        f"{_STATS}.truncated_probit_regression",
        "TruncatedProbitRegression",
        None,
    ),
    (
        "TruncatedLogisticRegression",
        f"{_STATS}.truncated_logistic_regression",
        "TruncatedLogisticRegression",
        None,
    ),
    (
        "TruncatedMultinomialLogisticRegression",
        f"{_STATS}.truncated_multinomial_logistic_regression",
        "TruncatedMultinomialLogisticRegression",
        None,
    ),
    (
        "TruncatedLQR",
        f"{_STATS}.truncated_lqr",
        "TruncatedLQR",
        "delphi.configs.stats.truncated.lqr:TruncatedLQRConfig",
    ),
]

_SECTION = re.compile(r"^(\w[\w ]*):\s*$")
_ENTRY = re.compile(r"^(\*{0,2}\w+)(?:\s*\(([^)]*)\))?:\s*(.*)$")


def _load(path):
    """Return the attribute a "module:name" path names."""
    module, name = path.split(":")
    return getattr(importlib.import_module(module), name)


def _split_docstring(doc):
    """Split a Google-style docstring into its summary, body and sections.

    Returns:
        (summary, body, sections): the first paragraph, the prose before the
        first section, and a dict of section name to its entries, each a
        name -> description dict.
    """
    doc = inspect.cleandoc(doc or "")
    lines = doc.splitlines()
    prose, sections, current, entry = [], {}, None, None
    for line in lines:
        header = _SECTION.match(line)
        if header and not line.startswith(" "):
            current = header.group(1)
            sections.setdefault(current, {})
            entry = None
            continue
        if current is None:
            prose.append(line)
            continue
        stripped = line.strip()
        if not stripped:
            continue
        indent = len(line) - len(line.lstrip())
        match = _ENTRY.match(stripped)
        if match and indent <= 4:
            entry = match.group(1).lstrip("*")
            sections[current][entry] = match.group(3).strip()
        elif entry is not None:
            sections[current][entry] = f"{sections[current][entry]} {stripped}".strip()
    text = "\n".join(prose).strip()
    summary = text.split("\n\n")[0].replace("\n", " ") if text else ""
    return summary, text, sections


def _type_name(annotation):
    """Render an annotation the way it would be written in source."""
    if annotation is inspect.Parameter.empty:
        return None
    if isinstance(annotation, type):
        return annotation.__name__
    text = str(annotation).replace("typing.", "")
    text = re.sub(r"<class '([\w.]+)'>", r"\1", text)
    text = re.sub(r"\b(?:[a-z_][\w]*\.)+([A-Z]\w*)", r"\1", text)
    return text.replace("NoneType", "None")


def _default(value):
    """Render a default value as Python source, or None when there is none."""
    if value is inspect.Parameter.empty:
        return None
    if callable(value) and hasattr(value, "__name__"):
        return value.__name__
    return repr(value)


def _signature(cls, arg_docs):
    """Return the constructor's parameters, minus self."""
    params = []
    for param in inspect.signature(cls.__init__).parameters.values():
        if param.name == "self":
            continue
        params.append(
            {
                "name": param.name,
                "type": _type_name(param.annotation),
                "default": _default(param.default),
                "kind": param.kind.name.lower(),
                "description": arg_docs.get(param.name, ""),
            }
        )
    return params


# Config modules whose fields are shared by every model, and the group each
# lands in on the page. Fields declared anywhere else are the model's own.
_SHARED_GROUPS = {
    "delphi.configs.base": "Trainer",
    "delphi.configs.optimizers": "Optimizer",
    "delphi.configs.schedulers": "Learning-rate schedule",
    "delphi.configs.dataset": "Data",
}

_HIDDEN_METHOD_OWNERS = ("delphi.delphi", "delphi.statistical_model")
_SHOWN_BASE_METHODS = {"fit", "refine"}
# Public by name but called by the trainer, not by users.
_TRAINER_PROTOCOL = {
    "batch_metrics",
    "build_projection_set",
    "compute_loss",
    "compute_val_loss",
    "criterion_parameters",
    "default_radius",
    "description",
    "design_matrix",
    "evaluate",
    "forward",
    "latent_phi",
    "make_optimizer_and_schedule",
    "parameter_groups",
    "precondition",
    "register_weight",
    "regularize",
    "run_metrics",
    "should_stop",
    "train_batch",
    "validate_before_training",
}


def _owner(config_cls, name):
    """Return the class in the MRO that first declares a field."""
    for klass in config_cls.__mro__:
        if name in inspect.get_annotations(klass):
            return klass
    return config_cls


def _config(config_cls):
    """Return a pydantic config's fields, described from its MRO's docstrings."""
    described = {}
    for klass in reversed(config_cls.__mro__):
        _, _, sections = _split_docstring(klass.__doc__)
        described.update(sections.get("Attributes", {}))
    fields = []
    for name, field in config_cls.model_fields.items():
        default = (
            None
            if field.is_required()
            else repr(field.get_default(call_default_factory=True))
        )
        owner = _owner(config_cls, name)
        fields.append(
            {
                "name": name,
                "group": _SHARED_GROUPS.get(owner.__module__, "Model"),
                "declaredIn": owner.__name__,
                "type": _type_name(field.annotation),
                "default": default,
                "required": field.is_required(),
                "description": field.description or described.get(name, ""),
            }
        )
    return {
        "name": config_cls.__name__,
        "module": config_cls.__module__,
        "fields": fields,
    }


def _methods(cls):
    """Return the public methods the class defines or inherits from delphi."""
    out = []
    for name, member in inspect.getmembers(cls, inspect.isfunction):
        if name.startswith("_"):
            continue
        owner = next(k for k in cls.__mro__ if name in vars(k))
        if not owner.__module__.startswith("delphi"):
            continue
        if (
            name.endswith("_hook")
            or name in _TRAINER_PROTOCOL
            or (
                owner.__module__ in _HIDDEN_METHOD_OWNERS
                and name not in _SHOWN_BASE_METHODS
            )
        ):
            continue
        summary, _, _ = _split_docstring(member.__doc__)
        try:
            sig = (
                str(inspect.signature(member))
                .replace("(self, ", "(")
                .replace("(self)", "()")
            )
        except (TypeError, ValueError):
            sig = "(...)"
        sig = re.sub(r"\b(?:[a-z_][\w]*\.)+([A-Z]\w*)", r"\1", sig)
        out.append(
            {
                "name": name,
                "signature": sig,
                "summary": summary,
                "definedIn": owner.__name__,
            }
        )
    return out


def extract(key, module, name, config_path):
    """Return the API record of one model."""
    cls = getattr(importlib.import_module(module), name)
    summary, body, sections = _split_docstring(cls.__doc__)
    _, _, init_sections = _split_docstring(cls.__init__.__doc__)
    source = _load(config_path) if config_path else cls
    # An override may name a config class or a model whose config to use.
    config_cls = (
        source if hasattr(source, "model_fields") else getattr(source, "defaults", None)
    )
    return {
        "key": key,
        "module": module,
        "className": name,
        "summary": summary,
        "docstring": body,
        "attributes": sections.get("Attributes", {}),
        "params": _signature(cls, init_sections.get("Args", {})),
        "raises": init_sections.get("Raises", {}),
        "estimateSuffixes": list(getattr(cls, "estimate_suffixes", ()) or ()),
        "methods": _methods(cls),
        "config": config_cls,
    }


def _import_from_ref(ref):
    """Put a git ref's copy of the package first on sys.path."""
    repo = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()
    target = tempfile.mkdtemp(prefix="delphi-api-")
    archive = subprocess.run(
        ["git", "-C", repo, "archive", ref, "delphi"],
        capture_output=True,
        check=True,
    ).stdout
    subprocess.run(["tar", "-x", "-C", target], input=archive, check=True)
    sys.path.insert(0, target)
    print(f"documenting {ref} of {repo}")


def main():
    """Write the API JSON."""
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--out", required=True, type=pathlib.Path)
    parser.add_argument(
        "--ref",
        help="git ref of delphi.ai to document instead of its working tree",
    )
    args = parser.parse_args()
    if args.ref:
        _import_from_ref(args.ref)

    import delphi  # pylint: disable=import-outside-toplevel

    records, configs, failures = {}, {}, []
    for key, module, name, config_path in MODELS:
        try:
            record = extract(key, module, name, config_path)
            config_cls = record["config"]
            if config_cls is not None:
                configs.setdefault(config_cls.__name__, _config(config_cls))
                record["config"] = config_cls.__name__
            records[key] = record
        except Exception as error:  # pylint: disable=broad-except
            failures.append(f"{key}: {type(error).__name__}: {error}")
    if failures:
        sys.exit("could not extract:\n  " + "\n  ".join(failures))

    # The installed distribution's version is the released one; the package's
    # own __version__ has not tracked it.
    try:
        version = metadata.version("delphi-ai")
    except metadata.PackageNotFoundError:
        version = getattr(delphi, "__version__", None)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(
            {"version": version, "models": records, "configs": configs}, indent=1
        )
        + "\n"
    )
    print(f"wrote {len(records)} models to {args.out}")


if __name__ == "__main__":
    main()
