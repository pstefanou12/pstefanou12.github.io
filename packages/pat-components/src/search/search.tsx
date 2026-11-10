/**
 * @fileoverview The navbar search over every page; Ctrl+K or / focuses it.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {useEffect, useMemo, useRef, useState} from 'react';
import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import {useNavigate} from 'react-router-dom';

import type {NavTree} from '../nav/nav_tree';
import {buildSearchIndex, searchEntries} from './search_index';
import type {SearchEntry} from './search_index';

const MAX_RESULTS = 8;
// Lets a click on a result land before the list closes.
const BLUR_CLOSE_DELAY_MS = 150;

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
  );
}

function SearchIcon() {
  return (
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
  );
}

/** Props of Search. */
export interface SearchProps {
  tree: NavTree;
}

/** A search box whose results list pages by title, slug and keywords. */
export function Search({tree}: SearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const index = useMemo(() => buildSearchIndex(tree), [tree]);
  const results = useMemo(
    () => searchEntries(index, query, MAX_RESULTS),
    [index, query],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const shortcut =
        (e.key === 'k' && (e.ctrlKey || e.metaKey)) ||
        (e.key === '/' && !isTypingTarget(e.target));
      if (shortcut) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function go(entry: SearchEntry) {
    navigate(`/${entry.slug}`);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
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
      <SearchIcon />
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
          window.setTimeout(() => {
            setOpen(false);
          }, BLUR_CLOSE_DELAY_MS);
        }}
        onKeyDown={onKeyDown}
      />
      <kbd>Ctrl K</kbd>
      {open && query.trim() && (
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
                <span className="search-where">{entry.where}</span>
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
