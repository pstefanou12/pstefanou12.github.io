/**
 * @fileoverview Tables that scroll inside their own box, and the placeholder
 * an empty cell shows.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import type {ComponentProps, ReactNode} from 'react';

/** A table wrapped so a wide one scrolls instead of the page. */
export function Table(props: ComponentProps<'table'>) {
  return (
    <div className="table-wrap">
      <table {...props} />
    </div>
  );
}

/** Props of Description. */
export interface DescriptionProps {
  children?: ReactNode;
}

/** A cell's text, or a muted dash when there is none. */
export function Description({children}: DescriptionProps) {
  const empty = children === undefined || children === null || children === '';
  return empty ? <span className="muted">—</span> : <>{children}</>;
}
