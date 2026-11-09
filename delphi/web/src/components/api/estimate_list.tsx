const VARIANTS = [
  [
    'avg_',
    'Mean of the iterates after the burn-in. The one the guarantees are about; use this.',
  ],
  ['ema_', 'Bias-corrected exponential moving average of the iterates.'],
  ['final_', 'The last iterate.'],
  ['best_', 'The iterate with the lowest validation loss.'],
] as const;

/** Props of EstimateList. */
export interface EstimateListProps {
  /** Estimate suffixes, such as "rate_". */
  estimates: string[];
}

/** Each estimate in its four variants, as attributes of the fitted model. */
export function EstimateList({estimates}: EstimateListProps) {
  return (
    <div className="table-wrap">
      <table className="api-table estimates">
        <thead>
          <tr>
            <th>Variant</th>
            {estimates.map(estimate => (
              <th key={estimate}>
                <code>{estimate}</code>
              </th>
            ))}
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {VARIANTS.map(([prefix, meaning]) => (
            <tr key={prefix}>
              <td>
                <code>{prefix}</code>
              </td>
              {estimates.map(estimate => (
                <td key={estimate}>
                  <code className="api-name">
                    {prefix}
                    {estimate}
                  </code>
                </td>
              ))}
              <td>{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
