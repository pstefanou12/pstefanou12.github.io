/**
 * @fileoverview The navbar's tabs, one per part of the docs.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Link} from 'react-router-dom';

import {useCurrentSlug} from '../hooks/use_current_slug';
import {firstPageOf, partOf} from './nav_tree';
import type {NavTree} from './nav_tree';

/** Props of PartTabs. */
export interface PartTabsProps {
  tree: NavTree;
}

/** A tab per part, linking to its first page; the current part is marked. */
export function PartTabs({tree}: PartTabsProps) {
  const active = partOf(tree, useCurrentSlug())?.id;
  return (
    <nav className="part-tabs" aria-label="Parts of the docs">
      {tree.parts.map(part => (
        <Link
          key={part.id}
          to={firstPageOf(part)}
          className={`part-tab${part.id === active ? ' active' : ''}`}
          aria-current={part.id === active ? 'page' : undefined}
        >
          {part.title}
        </Link>
      ))}
    </nav>
  );
}
