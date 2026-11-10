/**
 * @fileoverview The docs shell: navbar (brand, part tabs, search, repository,
 * theme), sidebar, the routed page, and "On this page".
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {useEffect, useState} from 'react';
import {Link, Outlet} from 'react-router-dom';

import {useCurrentSlug} from '../hooks/use_current_slug';
import {PartTabs} from '../nav/part_tabs';
import {Sidebar} from '../nav/sidebar';
import type {NavTree} from '../nav/nav_tree';
import {CONTENT_ID, OnThisPage} from '../on_this_page/on_this_page';
import type {SourceLink} from '../on_this_page/on_this_page';
import {Search} from '../search/search';
import {ThemeToggle} from '../theme/theme_toggle';

/** What the navbar shows at its left. */
export interface Brand {
  /** A one-character mark, e.g. "δ". */
  readonly mark: string;
  readonly name: string;
  readonly version?: string;
}

/** Props of DocsShell. */
export interface DocsShellProps {
  tree: NavTree;
  brand: Brand;
  /** The project's repository, linked by the navbar's GitHub icon. */
  repositoryUrl: string;
  /** Links shown under a page's headings, e.g. its source. */
  sourceLinks?: (slug: string) => readonly SourceLink[];
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

/** The page frame every docs route renders inside. */
export function DocsShell({
  tree,
  brand,
  repositoryUrl,
  sourceLinks,
}: DocsShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slug = useCurrentSlug();

  // A new page starts at the top, with the mobile drawer closed.
  useEffect(() => {
    window.scrollTo(0, 0);
    setDrawerOpen(false);
  }, [slug]);

  return (
    <div className="shell">
      <header className="topbar">
        <button
          className="icon-button menu-button"
          aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={drawerOpen}
          onClick={() => {
            setDrawerOpen(open => !open);
          }}
        >
          <MenuIcon />
        </button>
        <Link to="/" className="brand">
          <span className="brand-mark">{brand.mark}</span>
          <span className="brand-name">{brand.name}</span>
          {brand.version && (
            <span className="brand-version">{brand.version}</span>
          )}
        </Link>
        <PartTabs tree={tree} />
        <div className="topbar-end">
          <Search tree={tree} />
          <a
            className="icon-button"
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${brand.name} on GitHub`}
          >
            <GitHubIcon />
          </a>
          <ThemeToggle />
        </div>
      </header>
      <div
        className={`drawer-scrim${drawerOpen ? ' open' : ''}`}
        onClick={() => {
          setDrawerOpen(false);
        }}
      />
      <Sidebar tree={tree} open={drawerOpen} />
      <main className="content" id={CONTENT_ID}>
        <Outlet />
      </main>
      <OnThisPage links={sourceLinks?.(slug)} />
    </div>
  );
}
