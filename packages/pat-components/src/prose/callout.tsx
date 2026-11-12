/**
 * @fileoverview An aside in prose: <Callout kind="warning">...</Callout>.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import type {ReactNode} from 'react';

/** The kinds of callout, each with its own color. */
export type CalloutKind = 'note' | 'tip' | 'warning';

/** Props of Callout. */
export interface CalloutProps {
  kind?: CalloutKind;
  title?: string;
  children: ReactNode;
}

/** A highlighted aside with an optional title. */
export function Callout({kind = 'note', title, children}: CalloutProps) {
  return (
    <div className={`callout callout-${kind}`}>
      {title && <p className="callout-title">{title}</p>}
      {children}
    </div>
  );
}
