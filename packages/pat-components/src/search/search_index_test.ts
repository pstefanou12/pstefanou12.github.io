/**
 * @fileoverview Tests for building and querying the search index.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {describe, expect, it} from 'vitest';

import {TREE} from '../testing/fixtures';
import {buildSearchIndex, searchEntries} from './search_index';

describe('search_index', () => {
  const index = buildSearchIndex(TREE);

  it('indexes every page with where it sits', () => {
    expect(index).toHaveLength(5);
    expect(index[2]).toMatchObject({
      slug: 'truncated-normal',
      where: 'Distributions · Truncated',
    });
  });

  it('matches titles, slugs and keywords, ignoring case', () => {
    expect(searchEntries(index, 'POISSON', 8).map(e => e.slug)).toEqual([
      'truncated-poisson',
    ]);
    expect(searchEntries(index, 'TruncatedNormal', 8).map(e => e.slug)).toEqual(
      ['truncated-normal'],
    );
  });

  it('returns nothing for a blank query and honours the limit', () => {
    expect(searchEntries(index, '   ', 8)).toEqual([]);
    expect(searchEntries(index, 'normal', 1)).toHaveLength(1);
  });
});
