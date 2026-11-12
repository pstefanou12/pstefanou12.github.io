/**
 * @fileoverview The docs' pages and their place in the navigation: the
 * navbar's parts, the sidebar's sections, and how each model page is built.
 * The routes, search, prev/next links and the landing page derive from NAV.
 * A model page's `apiKey` must be a key of generated/api.json's `models`.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {allPages} from 'pat-components';
import type {NavPage, NavPart, NavSection, NavTree} from 'pat-components';

import {model} from '../api';

/** The key of a paper in PAPERS. */
export type PaperKey = keyof typeof PAPERS;

/** A page of prose, rendered from content/guides/<slug>.mdx. */
export interface GuideEntry extends NavPage {
  readonly kind: 'guide';
  readonly summary: string;
}

/** Another class documented on an algorithm page, beside its main one. */
export interface Variant {
  /** Key into generated/api.json's `models`. */
  apiKey: string;
  /** The estimates of the variant, when its class does not declare them. */
  estimates?: string[];
}

/** One way to run a model whose hyperparameters depend on its arguments. */
export interface ConfigMode {
  /** When this config applies, e.g. "phi given". */
  label: string;
  /** The API record whose config this mode uses. */
  apiKey: string;
}

/** A model's page, rendered from the API record and optional MDX. */
export interface AlgorithmEntry extends NavPage {
  readonly kind: 'algorithm';
  /** One line under the title and on index cards. */
  readonly summary: string;
  /** Key into generated/api.json's `models`. */
  apiKey: string;
  /** The family's estimates, when the class does not declare them. */
  estimates?: string[];
  /** Further classes with the same purpose, each with its own reference. */
  variants?: Variant[];
  /** Configs by mode, for a class whose arguments pick its config. */
  configModes?: ConfigMode[];
  papers?: PaperKey[];
  /** Renders the generic exponential-family method section. */
  exponentialFamily?: boolean;
}

/** Any page in the docs. */
export type Entry = GuideEntry | AlgorithmEntry;

/** A group of pages in the sidebar. */
export type Section = NavSection<Entry>;

/** A tab of the navbar, with the one line its landing-page card shows. */
export interface Part extends NavPart<Entry> {
  readonly summary: string;
}

/** The delphi.ai repository. */
export const GITHUB = 'https://github.com/pstefanou12/delphi.ai';
/** The branch source links point at. */
export const SOURCE_BRANCH = 'master';
/** Where this site's MDX lives, for "Edit on GitHub" links. */
export const SITE_SOURCE =
  'https://github.com/pstefanou12/pstefanou12.github.io/edit/main/delphi/web/src/content';

/** Papers the algorithms implement or build on, by key. */
export const PAPERS = {
  dgtz18: {
    authors:
      'Constantinos Daskalakis, Themis Gouleakis, Christos Tzamos, Manolis Zampetakis',
    year: 2018,
    title: 'Efficient Statistics, in High Dimensions, from Truncated Samples',
    venue: 'FOCS',
    url: 'https://arxiv.org/abs/1809.03986',
  },
  dgtz19: {
    authors:
      'Constantinos Daskalakis, Themis Gouleakis, Christos Tzamos, Manolis Zampetakis',
    year: 2019,
    title: 'Computationally and Statistically Efficient Truncated Regression',
    venue: 'COLT',
    url: 'https://arxiv.org/abs/2010.12000',
  },
  ktz19: {
    authors: 'Vasilis Kontonis, Christos Tzamos, Manolis Zampetakis',
    year: 2019,
    title: 'Efficient Truncated Statistics with Unknown Truncation',
    venue: 'FOCS',
    url: 'https://arxiv.org/abs/1908.01034',
  },
  drz20: {
    authors: 'Constantinos Daskalakis, Dhruv Rohatgi, Manolis Zampetakis',
    year: 2020,
    title: 'Truncated Linear Regression in High Dimensions',
    venue: 'NeurIPS',
    url: 'https://arxiv.org/abs/2007.14539',
  },
  izd20: {
    authors: 'Andrew Ilyas, Emmanouil Zampetakis, Constantinos Daskalakis',
    year: 2020,
    title:
      'A Theoretical and Practical Framework for Regression and Classification from Truncated Samples',
    venue: 'AISTATS',
    url: 'https://proceedings.mlr.press/v108/ilyas20a.html',
  },
  dsyz21: {
    authors:
      'Constantinos Daskalakis, Patroklos Stefanou, Rui Yao, Manolis Zampetakis',
    year: 2021,
    title: 'Efficient Truncated Linear Regression with Unknown Noise Variance',
    venue: 'NeurIPS',
    url: 'https://arxiv.org/abs/2208.12042',
  },
  lmz24: {
    authors: 'Jane H. Lee, Anay Mehrotra, Manolis Zampetakis',
    year: 2024,
    title:
      'Efficient Statistics With Unknown Truncation, Polynomial Time Algorithms, Beyond Gaussians',
    venue: 'arXiv',
    url: 'https://arxiv.org/abs/2410.01656',
  },
  lwz23: {
    authors: 'Jane H. Lee, Andre Wibisono, Manolis Zampetakis',
    year: 2023,
    title: 'Learning Exponential Families from Truncated Samples',
    venue: 'NeurIPS',
    url: 'https://proceedings.neurips.cc/paper_files/paper/2023/hash/6d5f304fb4ed0243851e41699dca4287-Abstract-Conference.html',
  },
} as const satisfies Record<
  string,
  {authors: string; year: number; title: string; venue: string; url: string}
>;

// Search finds a model page by its class names too.
function classKeywords(
  apiKey: string,
  variants: readonly Variant[] = [],
): string[] {
  return [apiKey, ...variants.map(v => v.apiKey)].flatMap(key => {
    const className = model(key)?.className;
    return className ? [className] : [];
  });
}

function guide(slug: string, title: string, summary: string): GuideEntry {
  return {kind: 'guide', slug, title, summary};
}

/** A truncated exponential-family distribution in delphi.truncated.distributions. */
function family(
  apiKey: string,
  title: string,
  summary: string,
  extra: Partial<AlgorithmEntry> = {},
): AlgorithmEntry {
  return {
    kind: 'algorithm',
    slug: apiKey
      .replace(/^Truncated/, 'truncated')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase(),
    title,
    summary,
    apiKey,
    papers: ['lwz23', 'lmz24'],
    exponentialFamily: true,
    ...extra,
    keywords: classKeywords(apiKey, extra.variants),
  };
}

/** Any other model, in delphi.stats. */
function algorithm(
  slug: string,
  apiKey: string,
  title: string,
  summary: string,
  extra: Partial<AlgorithmEntry> = {},
): AlgorithmEntry {
  return {
    kind: 'algorithm',
    slug,
    apiKey,
    title,
    summary,
    ...extra,
    keywords: classKeywords(apiKey, extra.variants),
  };
}

// Every distribution, sorted by title in the sidebar.
const DISTRIBUTIONS: AlgorithmEntry[] = [
  family(
    'TruncatedMultivariateNormal',
    'Multivariate normal',
    'Mean and covariance of a Gaussian, with or without a membership oracle.',
    {
      estimates: ['loc_', 'covariance_matrix_'],
      papers: ['dgtz18', 'ktz19', 'lmz24'],
      exponentialFamily: false,
      configModes: [
        {label: 'phi given', apiKey: 'TruncatedMultivariateNormal'},
        {label: 'phi=None', apiKey: 'TruncatedMultivariateNormal:unknown'},
      ],
    },
  ),
  family(
    'TruncatedNormal',
    'Normal',
    'Mean and standard deviation of a univariate normal, known or unknown set.',
    {
      papers: ['dgtz18', 'ktz19', 'lmz24'],
      exponentialFamily: false,
      variants: [
        {apiKey: 'TruncatedNormalKnownVariance'},
        {apiKey: 'UnknownTruncationNormal'},
        {apiKey: 'UnknownTruncationNormalKnownVariance'},
      ],
    },
  ),
  family(
    'TruncatedHalfNormal',
    'Half-normal',
    'Scale of a half-normal distribution.',
  ),
  family(
    'TruncatedLogNormal',
    'Log-normal',
    'Location and scale of a log-normal distribution.',
  ),
  family(
    'TruncatedExponential',
    'Exponential',
    'Rate of an exponential distribution.',
  ),
  family(
    'TruncatedGamma',
    'Gamma',
    'Rate of a gamma distribution with known concentration.',
  ),
  family(
    'TruncatedGammaUnknownConcentration',
    'Gamma, unknown concentration',
    'Concentration and rate of a gamma distribution.',
  ),
  family(
    'TruncatedInverseGamma',
    'Inverse gamma',
    'Rate of an inverse gamma distribution with known concentration.',
  ),
  family(
    'TruncatedInverseGammaUnknownConcentration',
    'Inverse gamma, unknown concentration',
    'Concentration and rate of an inverse gamma distribution.',
  ),
  family(
    'TruncatedChi2',
    'Chi-squared',
    'Degrees of freedom of a chi-squared distribution.',
  ),
  family('TruncatedWeibull', 'Weibull', 'Scale of a Weibull distribution.'),
  family('TruncatedRayleigh', 'Rayleigh', 'Scale of a Rayleigh distribution.'),
  family('TruncatedMaxwell', 'Maxwell', 'Scale of a Maxwell distribution.'),
  family(
    'TruncatedPareto',
    'Pareto',
    'Shape of a Pareto distribution with known scale.',
  ),
  family(
    'TruncatedLaplace',
    'Laplace',
    'Scale of a Laplace distribution with known location.',
  ),
  family(
    'TruncatedGumbel',
    'Gumbel',
    'Location of a Gumbel distribution with known scale.',
  ),
  family(
    'TruncatedLevy',
    'Lévy',
    'Scale of a Lévy distribution with known location.',
  ),
  family(
    'TruncatedInverseGaussian',
    'Inverse Gaussian',
    'Mean and shape of an inverse Gaussian distribution.',
  ),
  family(
    'TruncatedBeta',
    'Beta',
    'Both concentrations of a beta distribution.',
  ),
  family(
    'TruncatedBetaPrime',
    'Beta prime',
    'Both concentrations of a beta prime distribution.',
  ),
  family(
    'TruncatedContinuousBernoulli',
    'Continuous Bernoulli',
    'Parameter of a continuous Bernoulli distribution.',
  ),
  family(
    'TruncatedVonMises',
    'von Mises',
    'Location and concentration of a von Mises distribution.',
  ),
  family('TruncatedPoisson', 'Poisson', 'Rate of a Poisson distribution.'),
  family(
    'TruncatedBinomial',
    'Binomial',
    'Success probability of a binomial distribution with known trials.',
  ),
  family(
    'TruncatedGeometric',
    'Geometric',
    'Success probability of a geometric distribution.',
  ),
  family(
    'TruncatedNegativeBinomial',
    'Negative binomial',
    'Success probability of a negative binomial distribution with known failures.',
  ),
  family(
    'TruncatedLogarithmic',
    'Logarithmic',
    'Parameter of a logarithmic series distribution.',
  ),
  family(
    'TruncatedBooleanProduct',
    'Boolean product',
    'Coordinate probabilities of a product of Bernoullis on the hypercube.',
  ),
  family(
    'TruncatedMultinomial',
    'Multinomial',
    'Category probabilities of a multinomial distribution with known trials.',
  ),
  family(
    'TruncatedDirichlet',
    'Dirichlet',
    'Concentrations of a Dirichlet distribution.',
  ),
  family(
    'TruncatedWishart',
    'Wishart',
    'Degrees of freedom and scale of a Wishart distribution.',
  ),
  family(
    'TruncatedInverseWishart',
    'Inverse Wishart',
    'Degrees of freedom and scale of an inverse Wishart distribution.',
  ),
].sort((a, b) => a.title.localeCompare(b.title, 'en', {sensitivity: 'base'}));

/** The navbar's tabs, in order. */
export const PARTS: Part[] = [
  {
    id: 'start',
    title: 'Get started',
    summary: 'Install delphi.ai and fit a first model.',
    sections: [
      {
        id: 'start',
        title: 'Get started',
        pages: [
          guide(
            'installation',
            'Installation',
            'Install delphi.ai with Poetry and just.',
          ),
          guide(
            'quickstart',
            'Quickstart',
            'Recover a correlated Gaussian seen only on a half-plane.',
          ),
        ],
      },
    ],
  },
  {
    id: 'truncated',
    title: 'Truncated',
    summary:
      'Recover distributions, regressions and classifiers from samples missing everything outside a set.',
    sections: [
      {
        id: 'truncated-overview',
        title: 'Overview',
        pages: [
          guide(
            'truncated-statistics',
            'Truncated statistics',
            'Estimation when every observation outside a set is missing.',
          ),
          guide(
            'usage-notes',
            'Usage notes',
            'Truncation sets, alpha, hyperparameters and estimates.',
          ),
        ],
      },
      {id: 'distributions', title: 'Distributions', pages: DISTRIBUTIONS},
      {
        id: 'regression',
        title: 'Regression',
        pages: [
          algorithm(
            'truncated-linear-regression',
            'TruncatedLinearRegression',
            'Linear regression',
            'Least squares, corrected for a response observed only inside a set.',
            {
              estimates: ['coef_', 'intercept_', 'variance_'],
              papers: ['dgtz19', 'dsyz21'],
            },
          ),
          algorithm(
            'truncated-lasso-regression',
            'TruncatedLassoRegression',
            'Lasso regression',
            'A k-sparse linear model from fewer samples than dimensions.',
            {estimates: ['coef_', 'intercept_'], papers: ['drz20']},
          ),
        ],
      },
      {
        id: 'classification',
        title: 'Classification',
        pages: [
          algorithm(
            'truncated-probit-regression',
            'TruncatedProbitRegression',
            'Probit regression',
            'Binary labels from a Gaussian latent, kept only where the latent is in a set.',
            {estimates: ['coef_', 'intercept_'], papers: ['izd20']},
          ),
          algorithm(
            'truncated-logistic-regression',
            'TruncatedLogisticRegression',
            'Logistic regression',
            'Binary labels from a logistic latent, kept only where the latent is in a set.',
            {estimates: ['coef_', 'intercept_'], papers: ['izd20']},
          ),
          algorithm(
            'truncated-multinomial-logistic-regression',
            'TruncatedMultinomialLogisticRegression',
            'Multinomial logistic regression',
            'K-class softmax regression, kept only where the latent vector is in a set.',
            {estimates: ['coef_', 'intercept_'], papers: ['izd20']},
          ),
        ],
      },
      {
        id: 'control',
        title: 'Dynamical systems',
        pages: [
          algorithm(
            'truncated-lqr',
            'TruncatedLQR',
            'Linear quadratic regulator',
            'Three phases that remove truncation bias from a controlled linear system.',
            {estimates: []},
          ),
        ],
      },
    ],
  },
  {
    id: 'torchnomials',
    title: 'torchnomials',
    summary:
      'Orthogonal polynomial families in torch: Hermite, Laguerre and empirical.',
    sections: [
      {
        id: 'torchnomials',
        title: 'torchnomials',
        pages: [
          guide(
            'torchnomials',
            'torchnomials',
            'Hermite, Laguerre and empirical orthonormal families in torch.',
          ),
        ],
      },
    ],
  },
  {
    id: 'notes',
    title: 'Developer notes',
    summary: 'How the trainer fits every model, and what a model supplies.',
    sections: [
      {
        id: 'notes',
        title: 'Developer notes',
        pages: [
          guide(
            'trainer',
            'The trainer',
            'Warm start, phases and runs: how every model is fit.',
          ),
          guide(
            'models',
            'Models',
            'What a DelphiModel supplies, and the layers built on it.',
          ),
        ],
      },
    ],
  },
  {
    id: 'contributing',
    title: 'Contributing',
    summary: 'Add a model: what is expected, code style and review.',
    sections: [
      {
        id: 'contributing',
        title: 'Contributing',
        pages: [
          guide(
            'adding-a-model',
            'Adding a model',
            'What a new model needs, the code style, and how it is reviewed.',
          ),
        ],
      },
    ],
  },
  {
    id: 'citing',
    title: 'Citing',
    summary: 'Cite delphi.ai, and the papers its algorithms implement.',
    sections: [
      {
        id: 'citing',
        title: 'Citing',
        pages: [
          guide(
            'citing',
            'Citing',
            'Cite delphi.ai, and the papers its algorithms implement.',
          ),
        ],
      },
    ],
  },
];

/** The whole navigation. */
export const NAV: NavTree<Entry> = {parts: PARTS};

/** Every page, in navigation order. */
export const PAGES: readonly Entry[] = allPages(NAV);

/** Returns the pages that cite a paper. */
export function pagesCiting(paper: PaperKey): AlgorithmEntry[] {
  return PAGES.filter(
    (p): p is AlgorithmEntry =>
      p.kind === 'algorithm' && (p.papers ?? []).includes(paper),
  );
}
