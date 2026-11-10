/**
 * @fileoverview pat-components: the React pieces the site's apps share.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

export {useCurrentSlug} from './hooks/use_current_slug';
export {
  allPages,
  breadcrumb,
  firstPageOf,
  neighbours,
  pageBySlug,
  partOf,
  sectionOf,
} from './nav/nav_tree';
export type {
  NavPage,
  NavPart,
  NavSection,
  NavTree,
  Neighbours,
} from './nav/nav_tree';
export {PartTabs} from './nav/part_tabs';
export type {PartTabsProps} from './nav/part_tabs';
export {PrevNext} from './nav/prev_next';
export type {PrevNextProps} from './nav/prev_next';
export {Sidebar} from './nav/sidebar';
export type {SidebarProps} from './nav/sidebar';
export {CONTENT_ID, OnThisPage} from './on_this_page/on_this_page';
export type {OnThisPageProps, SourceLink} from './on_this_page/on_this_page';
export {Anchor} from './prose/anchor';
export {Callout} from './prose/callout';
export type {CalloutKind, CalloutProps} from './prose/callout';
export {CodeBlock} from './prose/code_block';
export type {CodeBlockProps} from './prose/code_block';
export {PROSE_COMPONENTS} from './prose/prose_components';
export {ResultTable} from './prose/result_table';
export type {ResultRow, ResultTableProps} from './prose/result_table';
export {Description, Table} from './prose/table';
export type {DescriptionProps} from './prose/table';
export {Tex} from './prose/tex';
export type {TexProps} from './prose/tex';
export {buildSearchIndex, searchEntries} from './search/search_index';
export type {SearchEntry} from './search/search_index';
export {Search} from './search/search';
export type {SearchProps} from './search/search';
export {DocsShell} from './shell/docs_shell';
export type {Brand, DocsShellProps} from './shell/docs_shell';
export {ThemeToggle} from './theme/theme_toggle';
export {DEFAULT_THEME, THEME_STORAGE_KEY, useTheme} from './theme/use_theme';
export type {Theme, ThemeState} from './theme/use_theme';
