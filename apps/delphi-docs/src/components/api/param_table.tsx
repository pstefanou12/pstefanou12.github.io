/**
 * @fileoverview A constructor's arguments: type, default and description.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Description, Table} from 'pat-components';

import type {Param} from '../../api';
import {Inline} from '../doc';

/** Props of ParamTable. */
export interface ParamTableProps {
  params: readonly Param[];
}

/** One row per argument, required ones marked. */
export function ParamTable({params}: ParamTableProps) {
  return (
    <Table className="api-table">
      <thead>
        <tr>
          <th>Argument</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {params.map(param => (
          <tr key={param.name}>
            <td>
              <code className="api-name">{param.name}</code>
              {param.type && <div className="api-type">{param.type}</div>}
              <div className="api-default">
                {param.default === null ? (
                  <span className="required">required</span>
                ) : (
                  <>= {param.default}</>
                )}
              </div>
            </td>
            <td>
              <Description>
                {param.description && <Inline text={param.description} />}
              </Description>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
