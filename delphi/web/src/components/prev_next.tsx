import {Link} from 'react-router-dom';

import {neighbours} from '../content/registry';

/** Props of PrevNext. */
export interface PrevNextProps {
  slug: string;
}

/** Links to the pages before and after this one in the table of contents. */
export function PrevNext({slug}: PrevNextProps) {
  const {prev, next} = neighbours(slug);
  return (
    <nav className="prev-next" aria-label="Previous and next pages">
      {prev ? (
        <Link to={`/${prev.slug}`} className="pn prev">
          <span className="pn-label">Previous</span>
          <span className="pn-title">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={`/${next.slug}`} className="pn next">
          <span className="pn-label">Next</span>
          <span className="pn-title">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
