/**
 * @fileoverview Tests for the navigation model's lookups.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {describe, expect, it} from 'vitest';

import {TREE} from '../testing/fixtures';
import {
  allPages,
  breadcrumb,
  firstPageOf,
  neighbours,
  pageBySlug,
  partOf,
  sectionOf,
} from './nav_tree';

describe('nav_tree', () => {
  it('lists every page in navigation order', () => {
    expect(allPages(TREE).map(p => p.slug)).toEqual([
      'installation',
      'quickstart',
      'truncated-normal',
      'truncated-poisson',
      'coarsened-normal',
    ]);
  });

  it('finds a page, its part and its section', () => {
    expect(pageBySlug(TREE, 'truncated-poisson')?.title).toBe('Poisson');
    expect(partOf(TREE, 'coarsened-normal')?.id).toBe('distributions');
    expect(sectionOf(TREE, 'coarsened-normal')?.id).toBe('coarsened');
    expect(pageBySlug(TREE, 'missing')).toBeUndefined();
  });

  it('names part and section, or only the part when they match', () => {
    expect(breadcrumb(TREE, 'truncated-normal')).toBe(
      'Distributions · Truncated',
    );
    expect(breadcrumb(TREE, 'quickstart')).toBe('Get started');
    expect(breadcrumb(TREE, 'missing')).toBe('');
  });

  it('links neighbours across sections and parts', () => {
    const {prev, next} = neighbours(TREE, 'truncated-normal');
    expect(prev?.slug).toBe('quickstart');
    expect(next?.slug).toBe('truncated-poisson');
    expect(neighbours(TREE, 'installation').prev).toBeUndefined();
    expect(neighbours(TREE, 'missing')).toEqual({});
  });

  it('routes a part to its first page', () => {
    expect(firstPageOf(TREE.parts[1])).toBe('/truncated-normal');
  });
});
