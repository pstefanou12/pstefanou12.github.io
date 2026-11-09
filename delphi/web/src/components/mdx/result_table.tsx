import type {ReactNode} from 'react';

/** Props of ResultTable. */
export interface ResultTableProps {
  columns: string[];
  /** Each row is [label, ...cells]; the last row is delphi's estimate. */
  rows: ReactNode[][];
  caption?: ReactNode;
}

/**
 * Truth, the naive estimate and delphi's, side by side: the comparison every
 * example ends with.
 */
export function ResultTable({columns, rows, caption}: ResultTableProps) {
  return (
    <div className="table-wrap">
      <table className="result-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            <th />
            {columns.map(column => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, ...cells], i) => (
            <tr
              key={i}
              className={i === rows.length - 1 ? 'recovered' : undefined}
            >
              <th scope="row">{label}</th>
              {cells.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
