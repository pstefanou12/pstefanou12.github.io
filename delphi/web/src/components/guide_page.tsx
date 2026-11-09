import {guides} from '../content/mdx';
import type {GuideEntry} from '../content/registry';
import {sectionOf} from '../content/registry';
import {MdxBody} from './mdx_body';
import {PrevNext} from './prev_next';

/** Props of GuidePage. */
export interface GuidePageProps {
  entry: GuideEntry;
}

/** A guide: its title and its MDX. */
export function GuidePage({entry}: GuidePageProps) {
  const load = guides[entry.slug];
  return (
    <article className="page prose">
      <p className="eyebrow">{sectionOf(entry.slug)?.title}</p>
      <h1>{entry.title}</h1>
      {load ? (
        <MdxBody load={load} />
      ) : (
        <p>This guide has not been written yet.</p>
      )}
      <PrevNext slug={entry.slug} />
    </article>
  );
}
