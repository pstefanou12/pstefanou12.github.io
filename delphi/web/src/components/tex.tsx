import katex from 'katex';

/** Props of Tex. */
export interface TexProps {
  children: string;
  /** Display math on its own line, rather than inline. */
  block?: boolean;
}

/** KaTeX for TSX components; MDX pages use $...$ and $$...$$ directly. */
export function Tex({children, block = false}: TexProps) {
  // KaTeX escapes its input, so its output is safe to inject.
  const html = katex.renderToString(children, {
    displayMode: block,
    throwOnError: false,
  });
  return block ? (
    <div className="math-block" dangerouslySetInnerHTML={{__html: html}} />
  ) : (
    <span dangerouslySetInnerHTML={{__html: html}} />
  );
}
