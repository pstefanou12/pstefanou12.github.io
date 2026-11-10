/**
 * @fileoverview "On this page": the current page's headings, and links to its
 * source. Lazily loaded content changes the headings, so the list follows the
 * DOM rather than the route.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {useEffect, useState} from 'react';

import {useCurrentSlug} from '../hooks/use_current_slug';

/** The element the shell renders pages into. */
export const CONTENT_ID = 'content';

/** A link under the headings, such as "Edit on GitHub". */
export interface SourceLink {
  readonly label: string;
  readonly href: string;
}

interface Heading {
  readonly id: string;
  readonly text: string;
  readonly level: 2 | 3;
}

function collectHeadings(): Heading[] {
  const elements = document.querySelectorAll<HTMLElement>(
    `#${CONTENT_ID} h2[id], #${CONTENT_ID} h3[id]`,
  );
  return Array.from(elements).map(heading => ({
    id: heading.id,
    text: heading.textContent ?? '',
    level: heading.tagName === 'H2' ? 2 : 3,
  }));
}

function sameHeadings(a: readonly Heading[], b: readonly Heading[]): boolean {
  return a.length === b.length && a.every((h, i) => h.id === b[i].id);
}

/** Props of OnThisPage. */
export interface OnThisPageProps {
  links?: readonly SourceLink[];
}

/** The right-hand column. Its links scroll, since the router owns the hash. */
export function OnThisPage({links = []}: OnThisPageProps) {
  const slug = useCurrentSlug();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const content = document.getElementById(CONTENT_ID);
    if (!content) return;
    function update() {
      setHeadings(previous => {
        const next = collectHeadings();
        return sameHeadings(previous, next) ? previous : next;
      });
    }
    update();
    const observer = new MutationObserver(update);
    observer.observe(content, {childList: true, subtree: true});
    return () => {
      observer.disconnect();
    };
  }, [slug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      {rootMargin: '-64px 0px -70% 0px'},
    );
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => {
      observer.disconnect();
    };
  }, [headings]);

  return (
    <aside className="on-this-page" aria-label="On this page">
      {headings.length >= 2 && (
        <>
          <p className="otp-title">On this page</p>
          <ul>
            {headings.map(heading => (
              <li key={heading.id} className={`otp-level-${heading.level}`}>
                <a
                  href={`#${heading.id}`}
                  className={active === heading.id ? 'active' : undefined}
                  onClick={e => {
                    e.preventDefault();
                    document
                      .getElementById(heading.id)
                      ?.scrollIntoView({behavior: 'smooth'});
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {links.length > 0 && (
        <ul className="otp-links">
          {links.map(link => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
