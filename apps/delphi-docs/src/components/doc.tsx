/**
 * @fileoverview Python docstring text as React: ``literals`` as code, blank lines as
 * paragraphs, "- " items as lists.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Fragment} from 'react';

/** Props of Inline and Doc. */
export interface DocProps {
  text: string;
}

/** Renders one line of docstring text, with ``literals`` as code. */
export function Inline({text}: DocProps) {
  const parts = text.split(/``(.+?)``/g);
  return (
    <>
      {parts.map((part, i) =>
        // Odd parts are the captured literals.
        i % 2 === 1 ? (
          <code key={`${i}:${part}`}>{part}</code>
        ) : (
          <Fragment key={`${i}:${part}`}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function listItems(paragraph: string): string[] {
  return paragraph.split(/\s(?=- )/).map(item => item.replace(/^- /, ''));
}

/** Renders a docstring: blank lines split paragraphs, "- " starts a list. */
export function Doc({text}: DocProps) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
  return (
    <>
      {paragraphs.map(paragraph =>
        paragraph.startsWith('- ') ? (
          <ul key={paragraph}>
            {listItems(paragraph).map(item => (
              <li key={item}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={paragraph}>
            <Inline text={paragraph} />
          </p>
        ),
      )}
    </>
  );
}
