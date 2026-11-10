/**
 * @fileoverview Renders a component inside a router at a given page, with a
 * probe showing the current location.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {render} from '@testing-library/react';
import type {RenderResult} from '@testing-library/react';
import type {ReactElement} from 'react';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom';

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

/** Renders `ui` at `/<slug>`; `getByTestId('location')` shows the route. */
export function renderAt(ui: ReactElement, slug = ''): RenderResult {
  return render(
    <MemoryRouter
      initialEntries={[`/${slug}`]}
      future={{v7_startTransition: true, v7_relativeSplatPath: true}}
    >
      <Routes>
        <Route
          path="*"
          element={
            <>
              {ui}
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}
