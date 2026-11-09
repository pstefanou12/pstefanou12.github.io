import {useEffect, useMemo, useRef, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';

import {model} from '../api';
import {SECTIONS, sectionOf} from '../content/registry';
import type {Entry} from '../content/registry';

// Text a page is found by: its title, slug and, for algorithms, its class.
function haystack(entry: Entry): string {
  const className =
    entry.kind === 'algorithm' ? model(entry.apiKey)?.className : '';
  return [entry.title, entry.slug, className].join(' ').toLowerCase();
}

/** Props of Sidebar. */
export interface SidebarProps {
  /** Whether the mobile drawer is showing it. */
  open: boolean;
}

/** The table of contents: collapsible sections, filterable by name. */
export function Sidebar({open}: SidebarProps) {
  const {pathname} = useLocation();
  const slug = pathname.replace(/^\//, '');
  const activeSection = sectionOf(slug)?.id;
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  // The active page's section is always open, and its link in view.
  useEffect(() => {
    if (activeSection) {
      setCollapsed(current => {
        if (!current.has(activeSection)) return current;
        const next = new Set(current);
        next.delete(activeSection);
        return next;
      });
    }
    activeRef.current?.scrollIntoView({block: 'nearest'});
  }, [activeSection, slug]);

  const normalizedQuery = query.trim().toLowerCase();
  const sections = useMemo(
    () =>
      SECTIONS.map(section => ({
        ...section,
        pages: normalizedQuery
          ? section.pages.filter(p => haystack(p).includes(normalizedQuery))
          : section.pages,
      })).filter(section => section.pages.length > 0),
    [normalizedQuery],
  );

  function toggle(id: string) {
    setCollapsed(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside
      className={`sidebar${open ? ' open' : ''}`}
      aria-label="Table of contents"
    >
      <div className="sidebar-search">
        <input
          type="search"
          placeholder="Filter pages"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
          }}
          aria-label="Filter pages"
        />
      </div>
      <nav className="toc">
        {sections.map(section => {
          // A filter shows every match; otherwise sections keep their state.
          const isOpen = normalizedQuery !== '' || !collapsed.has(section.id);
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
              {isOpen && (
                <ul>
                  {section.pages.map(page => (
                    <li key={page.slug}>
                      <NavLink
                        to={`/${page.slug}`}
                        ref={page.slug === slug ? activeRef : undefined}
                        className={({isActive}) =>
                          `toc-link${isActive ? ' active' : ''}`
                        }
                      >
                        {page.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {sections.length === 0 && (
          <p className="toc-empty">No pages match “{query}”.</p>
        )}
      </nav>
    </aside>
  );
}
