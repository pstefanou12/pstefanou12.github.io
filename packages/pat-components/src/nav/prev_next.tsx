/**
 * @fileoverview Links to the pages before and after the current one.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Link} from 'react-router-dom';

import {useCurrentSlug} from '../hooks/use_current_slug';
import {neighbours} from './nav_tree';
import type {NavTree} from './nav_tree';

/** Props of PrevNext. */
export interface PrevNextProps {
  tree: NavTree;
}

/** The previous and next pages in navigation order. */
export function PrevNext({tree}: PrevNextProps) {
  const {prev, next} = neighbours(tree, useCurrentSlug());
  return (
    <nav className="prev-next" aria-label="Previous and next pages">
      {prev ? (
        <Link to={`/${prev.slug}`} className="pn prev">
          <span className="pn-label">Previous</span>
          <span className="pn-title">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={`/${next.slug}`} className="pn next">
          <span className="pn-label">Next</span>
          <span className="pn-title">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
