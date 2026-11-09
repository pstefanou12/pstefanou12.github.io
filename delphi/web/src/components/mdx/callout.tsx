import type {ReactNode} from 'react';

/** Props of Callout. */
export interface CalloutProps {
  kind?: 'note' | 'tip' | 'warning';
  title?: string;
  children: ReactNode;
}

/** An aside in an MDX page: <Callout kind="warning">...</Callout>. */
export function Callout({kind = 'note', title, children}: CalloutProps) {
  return (
    <div className={`callout callout-${kind}`}>
      {title && <p className="callout-title">{title}</p>}
      {children}
    </div>
  );
}
