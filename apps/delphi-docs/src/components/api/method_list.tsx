/**
 * @fileoverview A model's public methods, with signatures and summaries.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Description} from 'pat-components';

import type {Method} from '../../api';
import {Inline} from '../doc';

/** Props of MethodList. */
export interface MethodListProps {
  methods: readonly Method[];
}

/** A definition list of methods. */
export function MethodList({methods}: MethodListProps) {
  return (
    <dl className="method-list">
      {methods.map(method => (
        <div key={method.name} className="method">
          <dt>
            <code>
              <span className="api-name">{method.name}</span>
              <span className="api-type">{method.signature}</span>
            </code>
          </dt>
          <dd>
            <Description>
              {method.summary && <Inline text={method.summary} />}
            </Description>
          </dd>
        </div>
      ))}
    </dl>
  );
}
