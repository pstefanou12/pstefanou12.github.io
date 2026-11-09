import {config as getConfig, model as getModel} from '../api';
import type {Model} from '../api';
import {algorithms} from '../content/mdx';
import type {AlgorithmEntry} from '../content/registry';
import {GITHUB, SOURCE_BRANCH, sectionOf} from '../content/registry';
import {EstimateList} from './api/estimate_list';
import {HyperparameterTable} from './api/hyperparameter_table';
import {MethodList} from './api/method_list';
import {ParamTable} from './api/param_table';
import {Signature} from './api/signature';
import {Citation} from './citation';
import {Doc} from './doc';
import {ExponentialFamilyMethod} from './exponential_family_method';
import {CodeBlock} from './mdx/code_block';
import {MdxBody} from './mdx_body';
import {PrevNext} from './prev_next';

/** Props of AlgorithmPage. */
export interface AlgorithmPageProps {
  entry: AlgorithmEntry;
}

// The data a model is fit to, as the usage snippet names it.
function fitArguments(model: Model): string {
  if (model.className === 'TruncatedLQR') return '';
  return model.module.includes('.stats.') ? 'X, y' : 'S';
}

// How to import and construct the model, with its required arguments.
function usageSnippet(model: Model): string {
  const path = model.module.split('.');
  const leaf = path[path.length - 1];
  const parent = path.slice(0, -1).join('.');
  const required = model.params
    .filter(p => p.default === null && p.kind !== 'keyword_only')
    .map(p => p.name)
    .join(', ');
  return [
    `from ${parent} import ${leaf}`,
    '',
    `model = ${leaf}.${model.className}(${required})`,
    `model.fit(${fitArguments(model)})`,
  ].join('\n');
}

/**
 * The template every algorithm page shares: header, usage, the page's own
 * MDX (if written), then the API reference generated from the code.
 */
export function AlgorithmPage({entry}: AlgorithmPageProps) {
  const model = getModel(entry.apiKey);
  if (!model) {
    return (
      <article className="page prose">
        <h1>{entry.title}</h1>
        <p className="callout callout-warning">
          No API record for <code>{entry.apiKey}</code>. Run{' '}
          <code>npm run docs:api</code>.
        </p>
      </article>
    );
  }

  const config = getConfig(model.config);
  const estimates = entry.estimates ?? model.estimateSuffixes;
  const sourceUrl = `${GITHUB}/blob/${SOURCE_BRANCH}/${model.module.replace(/\./g, '/')}.py`;
  const load = algorithms[entry.slug];

  return (
    <article className="page prose">
      <p className="eyebrow">{sectionOf(entry.slug)?.title}</p>
      <h1>{entry.title}</h1>
      <p className="lead">{entry.summary}</p>
      <div className="meta-row">
        <code className="badge">{model.className}</code>
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
          Source
        </a>
      </div>

      <CodeBlock>
        <code className="language-python">{usageSnippet(model)}</code>
      </CodeBlock>

      {/* The class docstring stands in for prose until the page has its own. */}
      {!load && model.docstring && model.docstring !== model.summary && (
        <div className="docstring">
          <Doc text={model.docstring} />
        </div>
      )}

      {entry.exponentialFamily && (
        <ExponentialFamilyMethod className={model.className} />
      )}
      {load && <MdxBody load={load} />}

      <h2 id="api-reference">API reference</h2>
      <h3 id="constructor">Constructor</h3>
      <Signature model={model} />
      <ParamTable params={model.params} />
      {Object.keys(model.raises).length > 0 && (
        <ul className="raises">
          {Object.entries(model.raises).map(([err, why]) => (
            <li key={err}>
              <code>{err}</code>: {why}
            </li>
          ))}
        </ul>
      )}

      {estimates.length > 0 && (
        <>
          <h3 id="estimates">Estimates</h3>
          <EstimateList estimates={estimates} />
        </>
      )}

      {model.methods.length > 0 && (
        <>
          <h3 id="methods">Methods</h3>
          <MethodList methods={model.methods} />
        </>
      )}

      {config && (
        <>
          <h3 id="hyperparameters">Hyperparameters</h3>
          <HyperparameterTable config={config} />
        </>
      )}

      {entry.papers && entry.papers.length > 0 && (
        <>
          <h2 id="references">References</h2>
          <ul className="references">
            {entry.papers.map(id => (
              <li key={id}>
                <Citation id={id} />
              </li>
            ))}
          </ul>
        </>
      )}

      <PrevNext slug={entry.slug} />
    </article>
  );
}
