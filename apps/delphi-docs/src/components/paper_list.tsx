/**
 * @fileoverview Every paper the models implement, with the pages that use each.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Link} from 'react-router-dom';

import {PAPERS, pagesCiting} from '../content/registry';
import type {PaperKey} from '../content/registry';
import {Citation} from './citation';

/** Every paper the algorithms implement, with the pages that use each. */
export function PaperList() {
  // Safe: Object.keys of PAPERS returns exactly its keys.
  const keys = Object.keys(PAPERS) as PaperKey[];
  return (
    <ul className="references paper-list">
      {keys.map(key => {
        const pages = pagesCiting(key);
        return (
          <li key={key}>
            <Citation id={key} />
            {pages.length > 0 && (
              <span className="paper-pages">
                {' '}
                Used by:{' '}
                {pages.map((page, i) => (
                  <span key={page.slug}>
                    {i > 0 && ', '}
                    <Link to={`/${page.slug}`}>{page.title}</Link>
                  </span>
                ))}
                .
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
