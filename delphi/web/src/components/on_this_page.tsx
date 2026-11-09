import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';

interface Heading {
  id: string;
  text: string;
  level: number;
}

function collectHeadings(): Heading[] {
  const elements = document.querySelectorAll<HTMLElement>(
    '#content h2[id], #content h3[id]',
  );
  return Array.from(elements).map(heading => ({
    id: heading.id,
    text: heading.textContent ?? '',
    level: heading.tagName === 'H2' ? 2 : 3,
  }));
}

function sameHeadings(a: Heading[], b: Heading[]): boolean {
  return a.length === b.length && a.every((h, i) => h.id === b[i].id);
}

/**
 * The current page's headings. MDX bodies load lazily, so the list follows
 * the DOM rather than the route. Links scroll instead of setting the hash,
 * which the router owns.
 */
export function OnThisPage() {
  const {pathname} = useLocation();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const content = document.getElementById('content');
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
  }, [pathname]);

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

  if (headings.length < 2) return <aside className="on-this-page" />;

  return (
    <aside className="on-this-page" aria-label="On this page">
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
    </aside>
  );
}
