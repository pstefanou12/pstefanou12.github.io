// Lazy loaders for every MDX page, keyed by slug. A page without a file
// simply has no loader; algorithm pages then render from the API alone.
import type {ComponentType} from 'react';

/** What importing an MDX file yields. */
export interface MdxModule {
  default: ComponentType;
}

/** Imports one MDX page on demand. */
export type MdxLoader = () => Promise<MdxModule>;

function bySlug(modules: Record<string, MdxLoader>): Record<string, MdxLoader> {
  return Object.fromEntries(
    Object.entries(modules).map(([path, load]) => [
      path.replace(/^.*\//, '').replace(/\.mdx$/, ''),
      load,
    ]),
  );
}

/** Loaders for content/guides/<slug>.mdx. */
export const guides = bySlug(import.meta.glob<MdxModule>('./guides/*.mdx'));

/** Loaders for content/algorithms/<slug>.mdx. */
export const algorithms = bySlug(
  import.meta.glob<MdxModule>('./algorithms/*.mdx'),
);
