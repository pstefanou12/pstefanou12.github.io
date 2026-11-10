/**
 * @fileoverview A small navigation tree the package's tests share.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import type {NavTree} from '../nav/nav_tree';

/** Two parts: one with a single section, one with two sections. */
export const TREE: NavTree = {
  parts: [
    {
      id: 'start',
      title: 'Get started',
      sections: [
        {
          id: 'start',
          title: 'Get started',
          pages: [
            {slug: 'installation', title: 'Installation'},
            {slug: 'quickstart', title: 'Quickstart'},
          ],
        },
      ],
    },
    {
      id: 'distributions',
      title: 'Distributions',
      sections: [
        {
          id: 'truncated',
          title: 'Truncated',
          pages: [
            {
              slug: 'truncated-normal',
              title: 'Normal',
              keywords: ['TruncatedNormal'],
            },
            {slug: 'truncated-poisson', title: 'Poisson'},
          ],
        },
        {
          id: 'coarsened',
          title: 'Coarsened',
          pages: [{slug: 'coarsened-normal', title: 'Coarsened normal'}],
        },
      ],
    },
  ],
};
