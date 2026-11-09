import {Navigate, Route, Routes, useParams} from 'react-router-dom';

import {AlgorithmPage} from './components/algorithm_page';
import {GuidePage} from './components/guide_page';
import {Home} from './components/home';
import {Layout} from './components/layout';
import {pageBySlug} from './content/registry';

function Page() {
  const {slug = ''} = useParams();
  const entry = pageBySlug(slug);
  if (!entry) return <Navigate to="/" replace />;
  return entry.kind === 'guide' ? (
    <GuidePage key={slug} entry={entry} />
  ) : (
    <AlgorithmPage key={slug} entry={entry} />
  );
}

/** The docs' routes: the home page, and every registry page at /<slug>. */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path=":slug" element={<Page />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
