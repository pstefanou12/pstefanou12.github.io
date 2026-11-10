/**
 * @fileoverview KaTeX math for TSX; MDX pages use $...$ and $$...$$ directly.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import katex from 'katex';

/** Props of Tex. */
export interface TexProps {
  children: string;
  /** Display math on its own line, rather than inline. */
  block?: boolean;
}

/** Renders TeX with KaTeX. */
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
