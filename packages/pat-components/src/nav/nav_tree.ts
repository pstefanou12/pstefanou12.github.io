/**
 * @fileoverview The navigation model every docs app hands to the shell:
 * parts (navbar tabs) of sections (sidebar groups) of pages, and lookups on it.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

/** A page, routed at `/<slug>`. Apps extend it with their own fields. */
export interface NavPage {
  readonly slug: string;
  readonly title: string;
  /** One line for cards and search results. */
  readonly summary?: string;
  /** Extra words search matches, such as a class name. */
  readonly keywords?: readonly string[];
}

/** A titled group of pages in the sidebar. */
export interface NavSection<P extends NavPage = NavPage> {
  readonly id: string;
  readonly title: string;
  readonly pages: readonly P[];
}

/** A navbar tab: a part of the docs with its own sections. */
export interface NavPart<P extends NavPage = NavPage> {
  readonly id: string;
  readonly title: string;
  readonly summary?: string;
  readonly sections: ReadonlyArray<NavSection<P>>;
}

/** The whole navigation, in order. */
export interface NavTree<P extends NavPage = NavPage> {
  readonly parts: ReadonlyArray<NavPart<P>>;
}

/** The pages either side of one, for previous and next links. */
export interface Neighbours<P extends NavPage = NavPage> {
  readonly prev?: P;
  readonly next?: P;
}

/** Returns every page in navigation order. */
export function allPages<P extends NavPage>(tree: NavTree<P>): P[] {
  return tree.parts.flatMap(part => part.sections.flatMap(s => [...s.pages]));
}

/** Returns the page with a slug, if any. */
export function pageBySlug<P extends NavPage>(
  tree: NavTree<P>,
  slug: string,
): P | undefined {
  return allPages(tree).find(page => page.slug === slug);
}

/** Returns the part a page belongs to, if any. */
export function partOf<P extends NavPage>(
  tree: NavTree<P>,
  slug: string,
): NavPart<P> | undefined {
  return tree.parts.find(part =>
    part.sections.some(s => s.pages.some(p => p.slug === slug)),
  );
}

/** Returns the section a page belongs to, if any. */
export function sectionOf<P extends NavPage>(
  tree: NavTree<P>,
  slug: string,
): NavSection<P> | undefined {
  return tree.parts
    .flatMap(part => [...part.sections])
    .find(s => s.pages.some(p => p.slug === slug));
}

/** Returns where a page sits, e.g. "Distributions · Truncated". */
export function breadcrumb(tree: NavTree, slug: string): string {
  const part = partOf(tree, slug)?.title;
  const section = sectionOf(tree, slug)?.title;
  if (!part) return '';
  return section && section !== part ? `${part} · ${section}` : part;
}

/** Returns the pages before and after one in navigation order. */
export function neighbours<P extends NavPage>(
  tree: NavTree<P>,
  slug: string,
): Neighbours<P> {
  const pages = allPages(tree);
  const index = pages.findIndex(page => page.slug === slug);
  if (index < 0) return {};
  return {prev: pages[index - 1], next: pages[index + 1]};
}

/** Returns the route of the first page of a part. */
export function firstPageOf(part: NavPart): string {
  const first = part.sections[0]?.pages[0];
  return first ? `/${first.slug}` : '/';
}
