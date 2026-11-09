import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {defineConfig} from 'vite';

// The source lives in delphi/web; the build lands one level up, in delphi/,
// which GitHub Pages serves as-is at /delphi/. emptyOutDir stays off so the
// build never deletes the source; `npm run build:delphi` clears delphi/assets.
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
    outDir: '..',
    emptyOutDir: false,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // The API record and the libraries change on different schedules
        // from the app, so each gets its own cacheable chunk.
        manualChunks: id => {
          if (id.includes('generated/api.json')) return 'api';
          if (id.includes('node_modules/katex')) return 'katex';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
