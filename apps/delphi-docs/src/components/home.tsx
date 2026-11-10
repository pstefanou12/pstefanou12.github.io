/**
 * @fileoverview The landing page: what delphi.ai is, and a card per part of
 * the docs, as PyTorch's docs landing has.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {firstPageOf} from 'pat-components';
import {Link} from 'react-router-dom';

import {version} from '../api';
import {GITHUB, PARTS} from '../content/registry';
import type {Part} from '../content/registry';

interface PartCardProps {
  part: Part;
}

function PartCard({part}: PartCardProps) {
  return (
    <div className="card">
      <h3 className="card-title" id={part.id}>
        {part.title}
      </h3>
      <p className="card-body">{part.summary}</p>
      {part.sections.length > 1 && (
        <ul className="card-links">
          {part.sections.map(section => (
            <li key={section.id}>
              <Link to={`/${section.pages[0].slug}`}>{section.title}</Link>
            </li>
          ))}
        </ul>
      )}
      <Link className="button" to={firstPageOf(part)}>
        View docs
      </Link>
    </div>
  );
}

/** Renders the landing page. */
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
      <div className="card-grid home-parts">
        {PARTS.map(part => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
    </article>
  );
}
