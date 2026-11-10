/**
 * @fileoverview Keeps the navigation, the API manifest and the MDX pages
 * consistent: every page resolves, every MDX file and link has a page.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 * @vitest-environment node
 */

import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

import {model} from '../api';
import {PAGES, PAPERS, pagesCiting} from './registry';
import type {AlgorithmEntry, PaperKey} from './registry';

const CONTENT_DIR = fileURLToPath(new URL('.', import.meta.url));
const SLUGS = new Set(PAGES.map(page => page.slug));

function mdxFiles(folder: string): string[] {
  return readdirSync(`${CONTENT_DIR}/${folder}`)
    .filter(name => name.endsWith('.mdx'))
    .map(name => `${folder}/${name}`);
}

const MDX_FILES = [...mdxFiles('guides'), ...mdxFiles('algorithms')];

function algorithmPages(): AlgorithmEntry[] {
  return PAGES.filter((p): p is AlgorithmEntry => p.kind === 'algorithm');
}

describe('registry', () => {
  it('gives every page a unique slug', () => {
    expect(SLUGS.size).toBe(PAGES.length);
  });

  it('resolves every model, variant and config mode in the manifest', () => {
    const keys = algorithmPages().flatMap(page => [
      page.apiKey,
      ...(page.variants ?? []).map(v => v.apiKey),
      ...(page.configModes ?? []).map(m => m.apiKey),
    ]);
    const missing = keys.filter(key => !model(key));
    expect(missing).toEqual([]);
  });

  it('has a page for every MDX file', () => {
    const orphans = MDX_FILES.map(path =>
      path.replace(/^.*\//, '').replace(/\.mdx$/, ''),
    ).filter(slug => !SLUGS.has(slug));
    expect(orphans).toEqual([]);
  });

  it('only links MDX to pages that exist', () => {
    const broken = MDX_FILES.flatMap(path => {
      const text = readFileSync(`${CONTENT_DIR}/${path}`, 'utf8');
      return [...text.matchAll(/\]\(\/([a-z0-9-]+)\)/g)]
        .map(match => match[1])
        .filter(slug => !SLUGS.has(slug))
        .map(slug => `${path} → /${slug}`);
    });
    expect(broken).toEqual([]);
  });

  it('cites every paper from at least one page', () => {
    // Safe: Object.keys of PAPERS returns exactly its keys.
    const keys = Object.keys(PAPERS) as PaperKey[];
    expect(keys.filter(key => pagesCiting(key).length === 0)).toEqual([]);
  });
});
