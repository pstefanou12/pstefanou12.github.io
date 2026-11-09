// The single source of truth for the docs: every page, its place in the
// table of contents, and how its algorithm page is assembled. The sidebar,
// the routes, prev/next links and the home-page index all derive from here.
//
// Adding an algorithm page is one entry below (plus, optionally, an MDX file
// at content/algorithms/<slug>.mdx for its prose). Its `apiKey` must be one
// of the keys delphi/scripts/extract_api.py writes to generated/api.json.

/** The key of a paper in PAPERS. */
export type PaperKey = keyof typeof PAPERS;

/** A page of prose, rendered from content/guides/<slug>.mdx. */
export interface GuideEntry {
  kind: 'guide';
  slug: string;
  title: string;
  summary: string;
}

/** A model's page, rendered from the API record and optional MDX. */
export interface AlgorithmEntry {
  kind: 'algorithm';
  slug: string;
  title: string;
  /** One line under the title and on index cards. */
  summary: string;
  /** Key into generated/api.json's `models`. */
  apiKey: string;
  /** The family's estimates, when the class does not declare them. */
  estimates?: string[];
  papers?: PaperKey[];
  /** Renders the generic exponential-family method section. */
  exponentialFamily?: boolean;
}

/** Any page in the docs. */
export type Entry = GuideEntry | AlgorithmEntry;

/** A group of pages in the table of contents. */
export interface Section {
  id: string;
  title: string;
  pages: Entry[];
}

/** The delphi.ai repository. */
export const GITHUB = 'https://github.com/pstefanou12/delphi.ai';
/** The branch source links point at. */
export const SOURCE_BRANCH = 'master';

/** Papers the algorithm pages cite, by key. */
export const PAPERS = {
  dgtz18: {
    authors: 'Daskalakis, Gouleakis, Tzamos, Zampetakis',
    year: 2018,
    title: 'Efficient Statistics, in High Dimensions, from Truncated Samples',
    venue: 'FOCS',
  },
  dgtz19: {
    authors: 'Daskalakis, Gouleakis, Tzamos, Zampetakis',
    year: 2019,
    title: 'Computationally and Statistically Efficient Truncated Regression',
    venue: 'COLT',
  },
  ktz19: {
    authors: 'Kontonis, Tzamos, Zampetakis',
    year: 2019,
    title: 'Efficient Truncated Statistics with Unknown Truncation',
    venue: 'FOCS',
  },
  drz20: {
    authors: 'Daskalakis, Rohatgi, Zampetakis',
    year: 2020,
    title: 'Truncated Linear Regression in High Dimensions',
    venue: 'NeurIPS',
  },
  izd20: {
    authors: 'Ilyas, Zampetakis, Daskalakis',
    year: 2020,
    title:
      'A Theoretical and Practical Framework for Regression and Classification from Truncated Samples',
    venue: 'AISTATS',
  },
  dsyz21: {
    authors: 'Daskalakis, Stefanou, Yao, Zampetakis',
    year: 2021,
    title: 'Efficient Truncated Linear Regression with Unknown Noise Variance',
    venue: 'NeurIPS',
    url: 'https://arxiv.org/abs/2208.12042',
  },
  lwz23: {
    authors: 'Lee, Wibisono, Zampetakis',
    year: 2023,
    title: 'Learning Exponential Families from Truncated Samples',
    venue: 'NeurIPS',
  },
} as const satisfies Record<
  string,
  {authors: string; year: number; title: string; venue: string; url?: string}
>;

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
    papers: ['lwz23'],
    exponentialFamily: true,
    ...extra,
  };
}

/** Any other model, in delphi.truncated.distributions or delphi.stats. */
function algorithm(
  slug: string,
  apiKey: string,
  title: string,
  summary: string,
  extra: Partial<AlgorithmEntry> = {},
): AlgorithmEntry {
  return {kind: 'algorithm', slug, apiKey, title, summary, ...extra};
}

/** The table of contents, in order. */
export const SECTIONS: Section[] = [
  {
    id: 'start',
    title: 'Getting started',
    pages: [
      guide(
        'installation',
        'Installation',
        'Install delphi with Poetry and just.',
      ),
      guide(
        'quickstart',
        'Quickstart',
        'Recover a correlated Gaussian seen only on a half-plane.',
      ),
      guide(
        'usage-notes',
        'Usage notes',
        'Truncation sets, alpha, hyperparameters and estimates.',
      ),
    ],
  },
  {
    id: 'normal',
    title: 'Normal distributions',
    pages: [
      family(
        'TruncatedMultivariateNormal',
        'Multivariate normal',
        'Mean and covariance of a Gaussian, with or without a membership oracle.',
        {
          estimates: ['loc_', 'covariance_matrix_'],
          papers: ['dgtz18'],
          exponentialFamily: false,
        },
      ),
      family(
        'TruncatedNormal',
        'Normal',
        'Mean and standard deviation of a univariate normal.',
        {
          papers: ['dgtz18'],
          exponentialFamily: false,
        },
      ),
      family(
        'TruncatedNormalKnownVariance',
        'Normal, known variance',
        'Mean of a univariate normal whose variance is known.',
        {papers: ['dgtz18'], exponentialFamily: false},
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
    ],
  },
  {
    id: 'unknown',
    title: 'Unknown truncation',
    pages: [
      algorithm(
        'unknown-truncation-multivariate-normal',
        'TruncatedMultivariateNormal:unknown',
        'Multivariate normal, unknown set',
        'Recover a Gaussian and the set it was truncated to, without querying the set.',
        {estimates: ['loc_', 'covariance_matrix_'], papers: ['ktz19']},
      ),
      algorithm(
        'unknown-truncation-normal',
        'UnknownTruncationNormal',
        'Normal, unknown set',
        'Mean and standard deviation of a univariate normal truncated to an unknown set.',
        {papers: ['ktz19']},
      ),
      algorithm(
        'unknown-truncation-normal-known-variance',
        'UnknownTruncationNormalKnownVariance',
        'Normal, unknown set, known variance',
        'Mean of a univariate normal with known variance, truncated to an unknown set.',
        {papers: ['ktz19']},
      ),
    ],
  },
  {
    id: 'continuous',
    title: 'Continuous distributions',
    pages: [
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
      family(
        'TruncatedRayleigh',
        'Rayleigh',
        'Scale of a Rayleigh distribution.',
      ),
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
    ],
  },
  {
    id: 'discrete',
    title: 'Discrete distributions',
    pages: [
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
    ],
  },
  {
    id: 'matrix',
    title: 'Simplex and matrix distributions',
    pages: [
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
    ],
  },
  {
    id: 'regression',
    title: 'Truncated regression',
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
  {
    id: 'architecture',
    title: 'Architecture',
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
      guide(
        'polynomials',
        'Polynomials',
        'Hermite, Laguerre and empirical orthonormal families in torch.',
      ),
      guide(
        'adding-a-distribution',
        'Adding a distribution',
        'Three steps from a family class to a tested model.',
      ),
    ],
  },
];

/** Every page, in table-of-contents order. */
export const PAGES: Entry[] = SECTIONS.flatMap(s => s.pages);

/** The pages either side of one, for previous and next links. */
export interface Neighbours {
  prev?: Entry;
  next?: Entry;
}

/** Returns the section a page belongs to. */
export function sectionOf(slug: string): Section | undefined {
  return SECTIONS.find(s => s.pages.some(p => p.slug === slug));
}

/** Returns the page with a slug. */
export function pageBySlug(slug: string): Entry | undefined {
  return PAGES.find(p => p.slug === slug);
}

/** Returns the pages before and after one in table-of-contents order. */
export function neighbours(slug: string): Neighbours {
  const index = PAGES.findIndex(p => p.slug === slug);
  return {prev: PAGES[index - 1], next: PAGES[index + 1]};
}
