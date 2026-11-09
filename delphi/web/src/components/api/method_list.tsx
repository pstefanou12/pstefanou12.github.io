import type {Method} from '../../api';
import {Inline} from '../doc';

/** Props of MethodList. */
export interface MethodListProps {
  methods: Method[];
}

/** A model's public methods, with their signatures and summaries. */
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
            {method.summary ? (
              <Inline text={method.summary} />
            ) : (
              <span className="muted">—</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
