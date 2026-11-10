/**
 * @fileoverview Where a page's source lives: its MDX on this site, and its
 * model's Python module in delphi.ai.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {pageBySlug} from 'pat-components';
import type {SourceLink} from 'pat-components';

import {model} from '../api';
import type {Model} from '../api';
import {algorithms, guides} from './mdx';
import {GITHUB, NAV, SITE_SOURCE, SOURCE_BRANCH} from './registry';

/** Returns the GitHub URL of a model's Python module. */
export function sourceUrl(record: Model): string {
  const path = record.module.replace(/\./g, '/');
  return `${GITHUB}/blob/${SOURCE_BRANCH}/${path}.py`;
}

/** Returns "Edit on GitHub" for a page's MDX, and its model's source. */
export function sourceLinks(slug: string): SourceLink[] {
  const entry = pageBySlug(NAV, slug);
  if (!entry) return [];
  const links: SourceLink[] = [];
  const mdx = entry.kind === 'guide' ? guides : algorithms;
  const folder = entry.kind === 'guide' ? 'guides' : 'algorithms';
  if (mdx[slug]) {
    links.push({
      label: 'Edit on GitHub',
      href: `${SITE_SOURCE}/${folder}/${slug}.mdx`,
    });
  }
  const record = entry.kind === 'algorithm' ? model(entry.apiKey) : undefined;
  if (record) links.push({label: 'Show source', href: sourceUrl(record)});
  return links;
}
