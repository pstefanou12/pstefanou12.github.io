import {useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {model} from '../api';
import {PAGES, breadcrumb} from '../content/registry';
import type {Entry} from '../content/registry';

const MAX_RESULTS = 8;

// Text a page is found by: its title, slug and, for algorithms, its classes.
function haystack(entry: Entry): string {
  const classes =
    entry.kind === 'algorithm'
      ? [entry.apiKey, ...(entry.variants ?? []).map(v => v.apiKey)]
          .map(key => model(key)?.className ?? '')
          .join(' ')
      : '';
  return [entry.title, entry.slug, classes].join(' ').toLowerCase();
}

/** The navbar's search over every page; Ctrl+K or / focuses it. */
export function Search() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const normalized = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      normalized
        ? PAGES.filter(p => haystack(p).includes(normalized)).slice(
            0,
            MAX_RESULTS,
          )
        : [],
    [normalized],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const typing =
        e.target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      if (
        (e.key === 'k' && (e.ctrlKey || e.metaKey)) ||
        (e.key === '/' && !typing)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function go(entry: Entry) {
    navigate(`/${entry.slug}`);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[highlighted]) {
      go(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="search">
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle
          cx="7"
          cy="7"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M11 11l3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search"
        aria-label="Search the docs"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setHighlighted(0);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
        }}
        onBlur={() => {
          // Let a click on a result land before the list closes.
          window.setTimeout(() => {
            setOpen(false);
          }, 150);
        }}
        onKeyDown={onKeyDown}
      />
      <kbd>Ctrl K</kbd>
      {open && normalized && (
        <ul className="search-results" role="listbox">
          {results.map((entry, i) => (
            <li
              key={entry.slug}
              role="option"
              aria-selected={i === highlighted}
            >
              <button
                className={i === highlighted ? 'highlighted' : undefined}
                onMouseDown={e => {
                  e.preventDefault();
                  go(entry);
                }}
              >
                <span className="search-title">{entry.title}</span>
                <span className="search-where">{breadcrumb(entry.slug)}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="search-empty">No pages match “{query}”.</li>
          )}
        </ul>
      )}
    </div>
  );
}
