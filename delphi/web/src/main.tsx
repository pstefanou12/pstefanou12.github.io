import 'katex/dist/katex.min.css';
import './styles/tokens.css';
import './styles/layout.css';
import './styles/prose.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter} from 'react-router-dom';

import {App} from './app';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element.');

// GitHub Pages has no fallback to index.html for unknown paths, so routes
// live in the hash: /delphi/#/truncated-exponential.
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
