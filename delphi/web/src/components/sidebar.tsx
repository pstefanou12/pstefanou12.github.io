import {useEffect, useRef, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';

import {PARTS, partOf} from '../content/registry';
import type {Part, Section} from '../content/registry';

/** Props of Sidebar. */
export interface SidebarProps {
  /** Whether the mobile drawer is showing it. */
  open: boolean;
}

/**
 * The current part's sections, collapsible. On the landing page, and in the
 * mobile drawer, it lists every part, since the navbar's tabs are hidden.
 */
export function Sidebar({open}: SidebarProps) {
  const {pathname} = useLocation();
  const slug = pathname.replace(/^\//, '');
  const activePart = partOf(slug);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({block: 'nearest'});
  }, [slug]);

  function toggle(id: string) {
    setCollapsed(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderSection(section: Section, showTitle: boolean) {
    const isOpen = !collapsed.has(section.id);
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
    if (!showTitle) return <div key={section.id}>{links}</div>;
    return (
      <div key={section.id} className="toc-section">
        <button
          className="toc-heading"
          aria-expanded={isOpen}
          onClick={() => {
            toggle(section.id);
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
          <span className="toc-count">{section.pages.length}</span>
        </button>
        {isOpen && links}
      </div>
    );
  }

  // A part whose one section repeats its title shows the pages alone.
  function renderPart(part: Part) {
    const single = part.sections.length === 1;
    return part.sections.map(section => renderSection(section, !single));
  }

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Navigation">
      <nav className="toc">
        {activePart && (
          <div className="toc-current">
            <p className="toc-part-title">{activePart.title}</p>
            {renderPart(activePart)}
          </div>
        )}
        <div className={`toc-all${activePart ? ' drawer-only' : ''}`}>
          {PARTS.map(part => (
            <div key={part.id} className="toc-part-group">
              <p className="toc-part-title">{part.title}</p>
              {renderPart(part)}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
