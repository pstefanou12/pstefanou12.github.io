/**
 * @fileoverview Links in prose: internal ones through the router, the rest in
 * a new tab.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import type {ComponentProps} from 'react';
import {Link} from 'react-router-dom';

/** A link; `href="/slug"` routes within the app. */
export function Anchor({href = '', ...rest}: ComponentProps<'a'>) {
  if (href.startsWith('/')) return <Link to={href} {...rest} />;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...rest} />;
}
