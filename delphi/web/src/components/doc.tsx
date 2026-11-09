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
          <code key={i}>{part}</code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
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
      {paragraphs.map((paragraph, i) =>
        paragraph.startsWith('- ') ? (
          <ul key={i}>
            {listItems(paragraph).map((item, j) => (
              <li key={j}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            <Inline text={paragraph} />
          </p>
        ),
      )}
    </>
  );
}
