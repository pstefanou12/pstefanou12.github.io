import type {ComponentProps} from 'react';
import {Link} from 'react-router-dom';

import {PaperList} from '../paper_list';
import {Callout} from './callout';
import {CodeBlock} from './code_block';
import {ResultTable} from './result_table';

// Internal links (href="/slug") go through the router; others open a tab.
function Anchor({href = '', ...rest}: ComponentProps<'a'>) {
  if (href.startsWith('/')) return <Link to={href} {...rest} />;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...rest} />;
}

// Wide tables scroll inside their own box instead of the page.
function Table(props: ComponentProps<'table'>) {
  return (
    <div className="table-wrap">
      <table {...props} />
    </div>
  );
}

/** What MDX pages render elements and components with. */
export const components = {
  pre: CodeBlock,
  a: Anchor,
  table: Table,
  Callout,
  PaperList,
  ResultTable,
};
