/**
 * @fileoverview Builds the delphi.ai docs into dist/, which the Pages
 * workflow serves at /delphi/.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {defineConfig} from 'vite';

// The manifest and the libraries change on different schedules from the
// app, so each gets its own cacheable chunk.
function chunkFor(id: string): string | undefined {
  if (id.includes('generated/api.json')) return 'api';
  if (id.includes('node_modules/katex')) return 'katex';
  if (id.includes('node_modules')) return 'vendor';
  return undefined;
}

// Vite reads its config from the default export, the one exception to the
// named-exports rule.
export default defineConfig({
  base: './',
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeSlug, rehypeKatex],
      }),
    },
    react({include: /\.(mdx|tsx|ts)$/}),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {output: {manualChunks: chunkFor}},
  },
});
