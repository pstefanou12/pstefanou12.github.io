/**
 * @fileoverview The method every truncated exponential family shares, shown on family
 * pages until they have prose of their own.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Tex} from 'pat-components';
import {Link} from 'react-router-dom';

/** Props of ExponentialFamilyMethod. */
export interface ExponentialFamilyMethodProps {
  /** The model's class name, as the text refers to it. */
  className: string;
}

/**
 * The method every TruncatedExponentialFamilyDistribution shares. Family
 * pages render it in place of hand-written math until they get their own.
 */
export function ExponentialFamilyMethod({
  className,
}: ExponentialFamilyMethodProps) {
  return (
    <section>
      <h2 id="method">Method</h2>
      <p>
        The family is written in natural parameters,{' '}
        <Tex>{'p_\\theta(x) = h(x)\\exp(\\theta^\\top T(x) - A(\\theta))'}</Tex>
        , and observed only on a set <Tex>{'S'}</Tex> that the oracle{' '}
        <code>phi</code> answers membership queries for. The truncated density
        is{' '}
        <Tex>{'p_\\theta(x)\\,\\mathbf{1}\\{x \\in S\\} / P_\\theta(S)'}</Tex>,
        so the negative log-likelihood of a sample <Tex>{'x_1,\\dots,x_n'}</Tex>{' '}
        is
      </p>
      <Tex block>
        {
          '\\ell(\\theta) = -\\frac{1}{n}\\sum_{i=1}^n \\big(\\theta^\\top T(x_i) + \\log h(x_i)\\big) + A(\\theta) + \\log P_\\theta(S).'
        }
      </Tex>
      <p>
        It is convex in <Tex>{'\\theta'}</Tex>, with gradient and Hessian
      </p>
      <Tex block>
        {
          '\\nabla \\ell(\\theta) = \\mathbb{E}_{p_\\theta \\mid S}[T(x)] - \\frac{1}{n}\\sum_i T(x_i), \\qquad \\nabla^2 \\ell(\\theta) = \\operatorname{Cov}_{p_\\theta \\mid S}[T(x)].'
        }
      </Tex>
      <p>
        <code>{className}</code> estimates the first term by rejection sampling:
        it draws from the current model and keeps the draws <code>phi</code>{' '}
        admits. It starts from the untruncated MLE of the sample and descends by
        projected SGD, keeping <Tex>{'\\theta'}</Tex> in a sublevel set of the
        loss: its budget is sized from <code>alpha</code> when given, and
        otherwise widens phase by phase while the projection binds. The Fisher
        schedule sizes the steps from the Hessian above; see{' '}
        <Link to="/usage-notes">Usage notes</Link> and{' '}
        <Link to="/trainer">The trainer</Link>.
      </p>
    </section>
  );
}
