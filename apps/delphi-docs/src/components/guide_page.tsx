/**
 * @fileoverview A guide: its title and its MDX.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {PrevNext, breadcrumb} from 'pat-components';

import {guides} from '../content/mdx';
import {NAV} from '../content/registry';
import type {GuideEntry} from '../content/registry';
import {MdxBody} from './mdx_body';

/** Props of GuidePage. */
export interface GuidePageProps {
  entry: GuideEntry;
}

/** Renders a guide page. */
export function GuidePage({entry}: GuidePageProps) {
  const load = guides[entry.slug];
  return (
    <article className="page prose">
      <p className="eyebrow">{breadcrumb(NAV, entry.slug)}</p>
      <h1>{entry.title}</h1>
      {load ? (
        <MdxBody load={load} />
      ) : (
        <p>This guide has not been written yet.</p>
      )}
      <PrevNext tree={NAV} />
    </article>
  );
}
