/**
 * @fileoverview The components MDX prose renders elements with; apps spread
 * it into their own map to add components of their own.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {Anchor} from './anchor';
import {Callout} from './callout';
import {CodeBlock} from './code_block';
import {ResultTable} from './result_table';
import {Table} from './table';

/** Element overrides and the components MDX pages may use by name. */
export const PROSE_COMPONENTS = {
  pre: CodeBlock,
  a: Anchor,
  table: Table,
  Callout,
  ResultTable,
};
