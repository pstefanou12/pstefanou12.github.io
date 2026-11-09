import {Link} from 'react-router-dom';

import {config as getConfig, model as getModel} from '../api';
import type {Model} from '../api';
import {algorithms} from '../content/mdx';
import type {AlgorithmEntry, ConfigMode} from '../content/registry';
import {GITHUB, SOURCE_BRANCH, breadcrumb} from '../content/registry';
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

function sourceUrl(model: Model): string {
  return `${GITHUB}/blob/${SOURCE_BRANCH}/${model.module.replace(/\./g, '/')}.py`;
}

interface ModelReferenceProps {
  model: Model;
  estimates: string[];
  configModes?: ConfigMode[];
  /** Nests the subsections under a heading per class, for variant pages. */
  nested: boolean;
}

// Constructor, estimates, methods and hyperparameters of one class.
function ModelReference({
  model,
  estimates,
  configModes,
  nested,
}: ModelReferenceProps) {
  const Sub = nested ? 'h4' : 'h3';
  function id(name: string): string {
    return nested ? `${model.className}-${name}` : name;
  }
  const config = getConfig(model.config);
  const modes = (configModes ?? [])
    .map(mode => ({
      mode,
      config: getConfig(getModel(mode.apiKey)?.config ?? null),
    }))
    .filter(m => m.config);
  return (
    <>
      {nested && (
        <>
          <h3 id={model.className}>
            <code>{model.className}</code>
          </h3>
          <p>
            {model.summary}{' '}
            <a
              href={sourceUrl(model)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
            </a>
          </p>
        </>
      )}
      <Sub id={id('constructor')}>Constructor</Sub>
      <Signature model={model} />
      <ParamTable params={model.params} />
      {Object.keys(model.raises).length > 0 && (
        <ul className="raises">
          {Object.entries(model.raises).map(([error, why]) => (
            <li key={error}>
              <code>{error}</code>: {why}
            </li>
          ))}
        </ul>
      )}

      {estimates.length > 0 && (
        <>
          <Sub id={id('estimates')}>Estimates</Sub>
          <EstimateList estimates={estimates} />
        </>
      )}

      {model.methods.length > 0 && (
        <>
          <Sub id={id('methods')}>Methods</Sub>
          <MethodList methods={model.methods} />
        </>
      )}

      {modes.length > 0 ? (
        <>
          <Sub id={id('hyperparameters')}>Hyperparameters</Sub>
          <p>The arguments pick the estimator, and with it the config:</p>
          {modes.map(({mode, config: modeConfig}) =>
            modeConfig ? (
              <details key={mode.label} className="field-group config-mode">
                <summary>
                  <code>{mode.label}</code>: <code>{modeConfig.name}</code>
                </summary>
                <div className="config-mode-body">
                  <HyperparameterTable config={modeConfig} />
                </div>
              </details>
            ) : null,
          )}
        </>
      ) : (
        config && (
          <>
            <Sub id={id('hyperparameters')}>Hyperparameters</Sub>
            <HyperparameterTable config={config} />
          </>
        )
      )}
    </>
  );
}

/**
 * The template every algorithm page shares: header, usage, the page's own
 * MDX (if written), the API reference generated from the code, and the
 * papers the algorithm implements.
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

  const variants = (entry.variants ?? []).flatMap(variant => {
    const record = getModel(variant.apiKey);
    return record
      ? [
          {
            model: record,
            estimates: variant.estimates ?? record.estimateSuffixes,
          },
        ]
      : [];
  });
  const nested = variants.length > 0;
  const load = algorithms[entry.slug];

  return (
    <article className="page prose">
      <p className="eyebrow">{breadcrumb(entry.slug)}</p>
      <h1>{entry.title}</h1>
      <p className="lead">{entry.summary}</p>
      <div className="meta-row">
        <code className="badge">{model.className}</code>
        {variants.map(v => (
          <code key={v.model.className} className="badge">
            {v.model.className}
          </code>
        ))}
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
      <ModelReference
        model={model}
        estimates={entry.estimates ?? model.estimateSuffixes}
        configModes={entry.configModes}
        nested={nested}
      />
      {variants.map(v => (
        <ModelReference
          key={v.model.className}
          model={v.model}
          estimates={v.estimates}
          nested
        />
      ))}

      {entry.papers && entry.papers.length > 0 && (
        <>
          <h2 id="references">References</h2>
          <p>
            The algorithm implements or builds on the following. See{' '}
            <Link to="/citing">Citing</Link> to cite delphi.ai itself.
          </p>
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
