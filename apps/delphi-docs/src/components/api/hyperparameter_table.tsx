/**
 * @fileoverview A config's fields: the model's own first, then the groups
 * every model shares, folded.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Description, Table} from 'pat-components';

import type {Config, ConfigField} from '../../api';
import {Inline} from '../doc';

// TODO(pstefanou12): Take the groups and their order from the delphi.ai
// manifest, which will title them by the config class that declares each.
/** The groups a config's fields fall in, in the order they are shown. */
const GROUP_ORDER: readonly string[] = [
  'Model',
  'Trainer',
  'Optimizer',
  'Learning-rate schedule',
  'Data',
];

/** The group shown open: the fields the model itself declares. */
const OWN_GROUP = 'Model';

interface FieldTableProps {
  fields: readonly ConfigField[];
}

function FieldTable({fields}: FieldTableProps) {
  return (
    <Table className="api-table">
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
              <Description>
                {field.description && <Inline text={field.description} />}
              </Description>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

/** How hyperparameters are passed; shown once above a page's configs. */
export function HyperparameterIntro() {
  return (
    <p>
      Pass any of these as <code>{'hyperparameters={"key": value}'}</code>. They
      are validated by the config named below; a key it does not declare is
      ignored with a warning.
    </p>
  );
}

/** Props of HyperparameterTable. */
export interface HyperparameterTableProps {
  config: Config;
}

/** The config's fields by group. */
export function HyperparameterTable({config}: HyperparameterTableProps) {
  const groups = GROUP_ORDER.map(name => ({
    name,
    fields: config.fields.filter(field => field.group === name),
  })).filter(group => group.fields.length > 0);

  return (
    <>
      <p className="config-name">
        Config: <code>{config.name}</code>
      </p>
      {groups.map(group =>
        group.name === OWN_GROUP ? (
          <FieldTable key={group.name} fields={group.fields} />
        ) : (
          <details key={group.name} className="disclosure">
            <summary>
              {group.name} <span className="badge">{group.fields.length}</span>
            </summary>
            <FieldTable fields={group.fields} />
          </details>
        ),
      )}
    </>
  );
}
