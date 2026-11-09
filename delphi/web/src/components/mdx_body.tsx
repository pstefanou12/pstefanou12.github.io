import {MDXProvider} from '@mdx-js/react';
import {useEffect, useState} from 'react';
import type {ComponentType} from 'react';

import type {MdxLoader} from '../content/mdx';
import {components} from './mdx';

/** Props of MdxBody. */
export interface MdxBodyProps {
  load: MdxLoader;
}

/** Loads one MDX page and renders it with the docs' components. */
export function MdxBody({load}: MdxBodyProps) {
  const [body, setBody] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    load().then(
      module => {
        // A function updater would be called, not stored, so wrap it.
        if (live) setBody(() => module.default);
      },
      (e: unknown) => {
        if (live) setError(String(e));
      },
    );
    return () => {
      live = false;
    };
  }, [load]);

  if (error) {
    return (
      <p className="callout callout-warning">
        Could not load this page: {error}
      </p>
    );
  }
  if (!body) return <div className="loading" aria-busy="true" />;
  const Body = body;
  return (
    <MDXProvider components={components}>
      <Body />
    </MDXProvider>
  );
}
