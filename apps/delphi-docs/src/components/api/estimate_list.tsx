/**
 * @fileoverview The estimates a fitted model exposes, each read at the four
 * iterates delphi.ai reports.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Table} from 'pat-components';

/** An iterate estimates are read at; mirrors delphi's `constants.Estimator`. */
export type EstimatorName = 'avg' | 'ema' | 'final' | 'best';

/** The iterates in the order the table lists them. */
const ESTIMATOR_ORDER: readonly EstimatorName[] = [
  'avg',
  'ema',
  'final',
  'best',
];

// TODO(pstefanou12): Read these from the delphi.ai manifest once
// constants.Estimator documents its members.
/** What each iterate is, keyed by estimator. */
const ESTIMATOR_DESCRIPTIONS: Readonly<Record<EstimatorName, string>> = {
  avg: 'Mean of the iterates after the burn-in. The one the guarantees are about; use this.',
  ema: 'Bias-corrected exponential moving average of the iterates.',
  final: 'The last iterate.',
  best: 'The iterate with the lowest validation loss.',
};

/** Props of EstimateList. */
export interface EstimateListProps {
  /** Estimate suffixes, such as "rate_". */
  suffixes: readonly string[];
}

/** A row per iterate, a column per estimate: `avg_rate_`, `ema_rate_`, ... */
export function EstimateList({suffixes}: EstimateListProps) {
  return (
    <Table className="api-table estimates">
      <thead>
        <tr>
          <th>Iterate</th>
          {suffixes.map(suffix => (
            <th key={suffix}>
              <code>{suffix}</code>
            </th>
          ))}
          <th>Meaning</th>
        </tr>
      </thead>
      <tbody>
        {ESTIMATOR_ORDER.map(estimator => (
          <tr key={estimator}>
            <td>
              <code>{estimator}_</code>
            </td>
            {suffixes.map(suffix => (
              <td key={suffix}>
                <code className="api-name">
                  {estimator}_{suffix}
                </code>
              </td>
            ))}
            <td>{ESTIMATOR_DESCRIPTIONS[estimator]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
