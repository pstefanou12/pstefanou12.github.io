import {Link} from 'react-router-dom';

import {version} from '../api';
import {GITHUB, SECTIONS} from '../content/registry';
import {CodeBlock} from './mdx/code_block';

const BIBTEX = `@software{stefanou_delphi,
  author  = {Stefanou, Patroklos},
  title   = {delphi: statistical estimation from truncated samples},
  url     = {${GITHUB}},
  version = {${version ?? ''}},
  year    = {2026},
}`;

/** The landing page: what delphi does, every page by section, and citing. */
export function Home() {
  const algorithms = SECTIONS.flatMap(s => s.pages).filter(
    p => p.kind === 'algorithm',
  ).length;
  return (
    <article className="page prose home">
      <p className="eyebrow">delphi {version && `v${version}`}</p>
      <h1>Statistics from truncated samples</h1>
      <p className="lead">
        When every observation outside some set is missing entirely, the sample
        is a biased view of the distribution that produced it. Given a
        membership oracle for that set, delphi recovers the distribution as it
        was before truncation, for {algorithms} models across distributions,
        regression and classification.
      </p>
      <div className="home-actions">
        <Link className="button primary" to="/quickstart">
          Quickstart
        </Link>
        <Link className="button" to="/installation">
          Install
        </Link>
        <a
          className="button"
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>

      {SECTIONS.filter(s => s.id !== 'start').map(section => (
        <section key={section.id}>
          <h2 id={section.id}>{section.title}</h2>
          <div className="card-grid">
            {section.pages.map(page => (
              <Link key={page.slug} to={`/${page.slug}`} className="card">
                <span className="card-title">{page.title}</span>
                <span className="card-summary">{page.summary}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <h2 id="citing">Citing</h2>
      <p>If you use delphi in your work, please cite it:</p>
      <CodeBlock>
        <code className="language-bibtex">{BIBTEX}</code>
      </CodeBlock>
    </article>
  );
}
