import type {Param} from '../../api';
import {Inline} from '../doc';

/** Props of ParamTable. */
export interface ParamTableProps {
  params: Param[];
}

/** The constructor's arguments: type, default and description. */
export function ParamTable({params}: ParamTableProps) {
  return (
    <div className="table-wrap">
      <table className="api-table">
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
                {param.description ? (
                  <Inline text={param.description} />
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
