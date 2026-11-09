import {PAPERS} from '../content/registry';
import type {PaperKey} from '../content/registry';

/** Props of Citation. */
export interface CitationProps {
  id: PaperKey;
}

/** One reference: authors (year). Title. Venue. */
export function Citation({id}: CitationProps) {
  const paper = PAPERS[id];
  const title = <cite>{paper.title}</cite>;
  return (
    <span className="citation">
      {paper.authors} ({paper.year}).{' '}
      {'url' in paper ? (
        <a href={paper.url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      ) : (
        title
      )}
      . {paper.venue}.
    </span>
  );
}
