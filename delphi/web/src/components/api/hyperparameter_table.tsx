import type {Config, ConfigField} from '../../api';
import {Inline} from '../doc';

// The model's own fields lead; the ones every model shares follow, folded.
const GROUP_ORDER = [
  'Model',
  'Trainer',
  'Optimizer',
  'Learning-rate schedule',
  'Data',
];

interface FieldTableProps {
  fields: ConfigField[];
}

function FieldTable({fields}: FieldTableProps) {
  return (
    <div className="table-wrap">
      <table className="api-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map(field => (
            <tr key={field.name}>
              <td title={`Declared in ${field.declaredIn}`}>
                <code className="api-name">{field.name}</code>
                {field.type && <div className="api-type">{field.type}</div>}
              </td>
              <td>
                {field.required ? (
                  <span className="required">required</span>
                ) : (
                  <code>{field.default}</code>
                )}
              </td>
              <td>
                {field.description ? (
                  <Inline text={field.description} />
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

/** Props of HyperparameterTable. */
export interface HyperparameterTableProps {
  config: Config;
}

/** A config's fields: the model's own first, then the shared groups folded. */
export function HyperparameterTable({config}: HyperparameterTableProps) {
  const groups = GROUP_ORDER.map(name => ({
    name,
    fields: config.fields.filter(field => field.group === name),
  })).filter(group => group.fields.length > 0);

  return (
    <>
      <p>
        Pass any of these as <code>{'hyperparameters={"key": value}'}</code>;
        they are validated by <code>{config.name}</code>. A key the config does
        not declare is ignored with a warning.
      </p>
      {groups.map(group =>
        group.name === 'Model' ? (
          <FieldTable key={group.name} fields={group.fields} />
        ) : (
          <details key={group.name} className="field-group">
            <summary>
              {group.name}{' '}
              <span className="toc-count">{group.fields.length}</span>
            </summary>
            <FieldTable fields={group.fields} />
          </details>
        ),
      )}
    </>
  );
}
