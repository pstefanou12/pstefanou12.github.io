/**
 * @fileoverview A fenced code block: syntax highlighting and a copy button.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Highlight} from 'prism-react-renderer';
import type {PrismTheme} from 'prism-react-renderer';
import {isValidElement, useState} from 'react';
import type {ReactNode} from 'react';

// Token colours come from pat-styles (.token.keyword, ...), so they follow
// the page's theme instead of being fixed inline.
const CSS_THEME: PrismTheme = {plain: {}, styles: []};
const COPIED_FEEDBACK_MS = 1500;

interface CodeProps {
  className?: string;
  children?: ReactNode;
}

/** Props of CodeBlock. */
export interface CodeBlockProps {
  /** One <code className="language-x"> element, as MDX passes to <pre>. */
  children?: ReactNode;
}

/** Renders a code block; stands in for MDX's <pre>. */
export function CodeBlock({children}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = isValidElement<CodeProps>(children) ? children : null;
  const source = String(code?.props.children ?? children ?? '').replace(
    /\n$/,
    '',
  );
  const language = code?.props.className?.replace(/^language-/, '') ?? 'text';

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
    } catch {
      // Clipboard access denied: leave the button as it was.
      return;
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, COPIED_FEEDBACK_MS);
  }

  return (
    <div className="code-block">
      <button
        className="copy"
        onClick={() => {
          void copy();
        }}
        aria-label="Copy code"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <Highlight code={source} language={language} theme={CSS_THEME}>
        {({tokens, getLineProps, getTokenProps}) => (
          <pre className={`language-${language}`}>
            <code>
              {tokens.map((line, i) => (
                // Lines are positional: the same text may repeat.
                <div key={i} {...getLineProps({line})}>
                  {line.map((token, j) => (
                    <span key={j} {...getTokenProps({token})} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
