import {PAPERS} from '../content/registry';
import type {PaperKey} from '../content/registry';

/** Props of Citation. */
export interface CitationProps {
  id: PaperKey;
}

/** One reference, its title linking to the paper: authors (year). Title. Venue. */
export function Citation({id}: CitationProps) {
  const paper = PAPERS[id];
  return (
    <span className="citation">
      {paper.authors} ({paper.year}).{' '}
      <a href={paper.url} target="_blank" rel="noopener noreferrer">
        <cite>{paper.title}</cite>
      </a>
      . {paper.venue}.
    </span>
  );
}
