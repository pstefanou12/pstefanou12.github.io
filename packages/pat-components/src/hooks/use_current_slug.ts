/**
 * @fileoverview The slug of the page the router is showing.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {useLocation} from 'react-router-dom';

/** Returns the current page's slug: the route without its leading slash. */
export function useCurrentSlug(): string {
  return useLocation().pathname.replace(/^\//, '');
}
