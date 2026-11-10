/**
 * @fileoverview A comparison table whose rows are labeled, the last one
 * highlighted: truth, the naive estimate and the model's, side by side.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import type {ReactNode} from 'react';

import {Table} from './table';

/** A row: its label, then one cell per column. Labels are unique. */
export type ResultRow = readonly [label: string, ...cells: ReactNode[]];

/** Props of ResultTable. */
export interface ResultTableProps {
  columns: readonly string[];
  rows: readonly ResultRow[];
  caption?: ReactNode;
  /** Highlights the last row, the result being shown off. */
  highlightLast?: boolean;
}

/** Renders labeled rows under column headings. */
export function ResultTable({
  columns,
  rows,
  caption,
  highlightLast = true,
}: ResultTableProps) {
  return (
    <Table className="result-table">
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
            key={label}
            className={
              highlightLast && i === rows.length - 1 ? 'highlight' : undefined
            }
          >
            <th scope="row">{label}</th>
            {cells.map((cell, j) => (
              <td key={columns[j] ?? j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
