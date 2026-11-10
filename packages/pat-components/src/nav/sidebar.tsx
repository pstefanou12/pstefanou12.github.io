/**
 * @fileoverview The sidebar: the current part's sections, collapsible; every
 * part on a page outside the tree, and in the mobile drawer.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {NavLink} from 'react-router-dom';

import {useCurrentSlug} from '../hooks/use_current_slug';
import {partOf} from './nav_tree';
import type {NavPart, NavSection, NavTree} from './nav_tree';

/** Props of Sidebar. */
export interface SidebarProps {
  tree: NavTree;
  /** Whether the mobile drawer is open, which also lists every part. */
  open: boolean;
}

interface SectionProps {
  section: NavSection;
  /** Shows the section's heading; a part with one section omits it. */
  titled: boolean;
  slug: string;
  activeRef: RefObject<HTMLAnchorElement>;
}

function SidebarSection({section, titled, slug, activeRef}: SectionProps) {
  const [open, setOpen] = useState(true);
  const links = (
    <ul>
      {section.pages.map(page => (
        <li key={page.slug}>
          <NavLink
            to={`/${page.slug}`}
            ref={page.slug === slug ? activeRef : undefined}
            className={({isActive}) => `toc-link${isActive ? ' active' : ''}`}
          >
            {page.title}
          </NavLink>
        </li>
      ))}
    </ul>
  );
  if (!titled) return links;
  return (
    <div className="toc-section">
      <button
        className="toc-heading"
        aria-expanded={open}
        onClick={() => {
          setOpen(current => !current);
        }}
      >
        <svg
          className="chevron"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
        >
          <path
            d="M3 2l4 3-4 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        {section.title}
        <span className="badge">{section.pages.length}</span>
      </button>
      {open && links}
    </div>
  );
}

interface PartProps {
  part: NavPart;
  slug: string;
  activeRef: RefObject<HTMLAnchorElement>;
}

function SidebarPart({part, slug, activeRef}: PartProps) {
  const titled = part.sections.length > 1;
  return (
    <div className="toc-part">
      <p className="toc-part-title">{part.title}</p>
      {part.sections.map(section => (
        <SidebarSection
          key={section.id}
          section={section}
          titled={titled}
          slug={slug}
          activeRef={activeRef}
        />
      ))}
    </div>
  );
}

/** The navigation down the left of the page. */
export function Sidebar({tree, open}: SidebarProps) {
  const slug = useCurrentSlug();
  const activeRef = useRef<HTMLAnchorElement>(null);
  const current = partOf(tree, slug);
  // The drawer stands in for the hidden navbar tabs, so it lists every part.
  const parts = current && !open ? [current] : tree.parts;

  useEffect(() => {
    activeRef.current?.scrollIntoView({block: 'nearest'});
  }, [slug]);

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Navigation">
      <nav>
        {parts.map(part => (
          <SidebarPart
            key={part.id}
            part={part}
            slug={slug}
            activeRef={activeRef}
          />
        ))}
      </nav>
    </aside>
  );
}
