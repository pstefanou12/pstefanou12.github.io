import {Link} from 'react-router-dom';

import {version} from '../api';
import {GITHUB, PARTS} from '../content/registry';
import type {Part} from '../content/registry';

interface PartCardProps {
  part: Part;
}

function PartCard({part}: PartCardProps) {
  const pages = part.sections.flatMap(s => s.pages);
  return (
    <div className="part-card">
      <h3 id={part.id}>{part.title}</h3>
      <p>{part.summary}</p>
      {part.sections.length > 1 && (
        <ul className="part-card-sections">
          {part.sections.map(section => (
            <li key={section.id}>
              <Link to={`/${section.pages[0].slug}`}>{section.title}</Link>
            </li>
          ))}
        </ul>
      )}
      <Link className="button" to={`/${pages[0].slug}`}>
        View docs
      </Link>
    </div>
  );
}

/** The landing page: what delphi.ai is, and a card for each part of the docs. */
export function Home() {
  return (
    <article className="page prose home">
      <h1>delphi.ai documentation</h1>
      <p className="lead">
        delphi.ai is a PyTorch library for machine learning development, built
        around one trainer that fits every model.
      </p>
      <p>
        {version && (
          <>
            Version <code>{version}</code>.{' '}
          </>
        )}
        Source and issues are on{' '}
        <a href={GITHUB} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>
      <div className="part-grid">
        {PARTS.map(part => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
    </article>
  );
}
