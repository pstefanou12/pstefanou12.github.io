/**
 * @fileoverview Mounts the docs app under a hash router.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import 'katex/dist/katex.min.css';
import 'pat-styles';
import './styles/docs.css';

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
    <HashRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
