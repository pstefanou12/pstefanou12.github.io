import {Highlight} from 'prism-react-renderer';
import type {PrismTheme} from 'prism-react-renderer';
import {isValidElement, useState} from 'react';
import type {ReactNode} from 'react';

// Token colours come from prose.css (.token.keyword, ...), so they follow the
// page's light or dark theme instead of being fixed inline.
const CSS_THEME: PrismTheme = {plain: {}, styles: []};

interface CodeProps {
  className?: string;
  children?: ReactNode;
}

/** Props of CodeBlock. */
export interface CodeBlockProps {
  /** A single <code className="language-x"> element, as MDX passes <pre>. */
  children?: ReactNode;
}

/** Fenced code: syntax highlighting and a copy button. Replaces MDX's <pre>. */
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
    }, 1500);
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
