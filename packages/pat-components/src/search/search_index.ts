/**
 * @fileoverview The search index over a NavTree, and matching against it.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {allPages, breadcrumb} from '../nav/nav_tree';
import type {NavTree} from '../nav/nav_tree';

/** One searchable page. */
export interface SearchEntry {
  readonly slug: string;
  readonly title: string;
  /** Where the page sits, e.g. "Distributions · Truncated". */
  readonly where: string;
  /** Lower-cased text a query matches against. */
  readonly text: string;
}

/** Returns a search entry for every page of the tree. */
export function buildSearchIndex(tree: NavTree): SearchEntry[] {
  return allPages(tree).map(page => ({
    slug: page.slug,
    title: page.title,
    where: breadcrumb(tree, page.slug),
    text: [page.title, page.slug, ...(page.keywords ?? [])]
      .join(' ')
      .toLowerCase(),
  }));
}

/** Returns up to `limit` entries containing the query, in index order. */
export function searchEntries(
  index: readonly SearchEntry[],
  query: string,
  limit: number,
): SearchEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return index.filter(entry => entry.text.includes(normalized)).slice(0, limit);
}
