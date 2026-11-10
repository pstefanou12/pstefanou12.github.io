/**
 * @fileoverview The template every model page shares: header and usage, the
 * page's own MDX if written, the API reference generated from the code, and
 * the papers the model implements.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {CodeBlock, PrevNext, breadcrumb} from 'pat-components';
import {Link} from 'react-router-dom';

import {config as getConfig, model as getModel} from '../api';
import type {Config, Model} from '../api';
import {algorithms} from '../content/mdx';
import {NAV} from '../content/registry';
import type {AlgorithmEntry, ConfigMode} from '../content/registry';
import {sourceUrl} from '../content/source_links';
import {EstimateList} from './api/estimate_list';
import {
  HyperparameterIntro,
  HyperparameterTable,
} from './api/hyperparameter_table';
import {MethodList} from './api/method_list';
import {ParamTable} from './api/param_table';
import {Signature} from './api/signature';
import {Citation} from './citation';
import {Doc} from './doc';
import {ExponentialFamilyMethod} from './exponential_family_method';
import {MdxBody} from './mdx_body';

/** Props of AlgorithmPage. */
export interface AlgorithmPageProps {
  entry: AlgorithmEntry;
}

interface ModeConfig {
  readonly mode: ConfigMode;
  readonly config: Config;
}

// TODO(pstefanou12): Take the fit arguments from the manifest's `fit`
// signature instead of guessing from the module.
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

function modeConfigs(modes: readonly ConfigMode[]): ModeConfig[] {
  return modes.flatMap(mode => {
    const config = getConfig(getModel(mode.apiKey)?.config ?? null);
    return config ? [{mode, config}] : [];
  });
}

interface ModelReferenceProps {
  model: Model;
  suffixes: readonly string[];
  configModes?: readonly ConfigMode[];
  /** Nests the subsections under a heading per class, for variant pages. */
  nested: boolean;
}

// Constructor, estimates, methods and hyperparameters of one class.
function ModelReference({
  model,
  suffixes,
  configModes = [],
  nested,
}: ModelReferenceProps) {
  const Heading = nested ? 'h4' : 'h3';
  function headingId(name: string): string {
    return nested ? `${model.className}-${name}` : name;
  }
  const config = getConfig(model.config);
  const modes = modeConfigs(configModes);
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
      <Heading id={headingId('constructor')}>Constructor</Heading>
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

      {suffixes.length > 0 && (
        <>
          <Heading id={headingId('estimates')}>Estimates</Heading>
          <EstimateList suffixes={suffixes} />
        </>
      )}

      {model.methods.length > 0 && (
        <>
          <Heading id={headingId('methods')}>Methods</Heading>
          <MethodList methods={model.methods} />
        </>
      )}

      {(modes.length > 0 || config) && (
        <Heading id={headingId('hyperparameters')}>Hyperparameters</Heading>
      )}
      {modes.length > 0 ? (
        <>
          <HyperparameterIntro />
          <p>The arguments pick the estimator, and with it the config:</p>
          {modes.map(({mode, config: modeConfig}) => (
            <details key={mode.label} className="disclosure">
              <summary>
                <code>{mode.label}</code>
              </summary>
              <div className="disclosure-body">
                <HyperparameterTable config={modeConfig} />
              </div>
            </details>
          ))}
        </>
      ) : (
        config && (
          <>
            <HyperparameterIntro />
            <HyperparameterTable config={config} />
          </>
        )
      )}
    </>
  );
}

/** Renders a model's page. */
export function AlgorithmPage({entry}: AlgorithmPageProps) {
  const model = getModel(entry.apiKey);
  if (!model) {
    return (
      <article className="page prose">
        <h1>{entry.title}</h1>
        <p className="callout callout-warning">
          No API record for <code>{entry.apiKey}</code>. Run{' '}
          <code>just docs-api</code>.
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
            suffixes: variant.estimates ?? record.estimateSuffixes,
          },
        ]
      : [];
  });
  const nested = variants.length > 0;
  const load = algorithms[entry.slug];

  return (
    <article className="page prose">
      <p className="eyebrow">{breadcrumb(NAV, entry.slug)}</p>
      <h1>{entry.title}</h1>
      <p className="lead">{entry.summary}</p>
      <div className="meta-row">
        {[model, ...variants.map(v => v.model)].map(record => (
          <code key={record.className} className="class-badge">
            {record.className}
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
        suffixes={entry.estimates ?? model.estimateSuffixes}
        configModes={entry.configModes}
        nested={nested}
      />
      {variants.map(v => (
        <ModelReference
          key={v.model.className}
          model={v.model}
          suffixes={v.suffixes}
          nested
        />
      ))}

      {entry.papers && entry.papers.length > 0 && (
        <>
          <h2 id="references">References</h2>
          <p>
            The model implements or builds on the following. See{' '}
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

      <PrevNext tree={NAV} />
    </article>
  );
}
