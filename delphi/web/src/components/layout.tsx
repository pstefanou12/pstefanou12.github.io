import {useEffect, useState} from 'react';
import {Outlet, useLocation} from 'react-router-dom';

import {OnThisPage} from './on_this_page';
import {Sidebar} from './sidebar';
import {TopBar} from './top_bar';

/** Three columns: the table of contents, the page, and its headings. */
export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {pathname} = useLocation();

  // A new page starts at the top, with the mobile drawer closed.
  useEffect(() => {
    window.scrollTo(0, 0);
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="shell">
      <TopBar
        drawerOpen={drawerOpen}
        onToggleDrawer={() => {
          setDrawerOpen(open => !open);
        }}
      />
      <div
        className={`drawer-scrim${drawerOpen ? ' open' : ''}`}
        onClick={() => {
          setDrawerOpen(false);
        }}
      />
      <Sidebar open={drawerOpen} />
      <main className="content" id="content">
        <Outlet />
      </main>
      <OnThisPage />
    </div>
  );
}
