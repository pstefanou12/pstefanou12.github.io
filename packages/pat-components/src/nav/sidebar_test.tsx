/**
 * @fileoverview Tests for the sidebar.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it} from 'vitest';

import {TREE} from '../testing/fixtures';
import {renderAt} from '../testing/render';
import {Sidebar} from './sidebar';

beforeAll(() => {
  // jsdom has no layout, so no scrollIntoView.
  Element.prototype.scrollIntoView = () => {};
});

describe('Sidebar', () => {
  it('shows only the current part, with the page marked active', () => {
    renderAt(<Sidebar tree={TREE} open={false} />, 'truncated-poisson');
    expect(screen.queryByText('Installation')).toBeNull();
    expect(screen.getByRole('link', {name: 'Poisson'})).toHaveClass('active');
  });

  it('lists every part off the tree and in the drawer', () => {
    renderAt(<Sidebar tree={TREE} open={false} />, '');
    expect(screen.getByText('Installation')).toBeInTheDocument();
    renderAt(<Sidebar tree={TREE} open />, 'truncated-poisson');
    expect(screen.getAllByText('Installation')).toHaveLength(2);
  });

  it('collapses a section', async () => {
    const user = userEvent.setup();
    renderAt(<Sidebar tree={TREE} open={false} />, 'truncated-poisson');
    await user.click(screen.getByRole('button', {name: /Coarsened/}));
    expect(screen.queryByText('Coarsened normal')).toBeNull();
    expect(screen.getByText('Poisson')).toBeInTheDocument();
  });

  it('omits the heading of a part with one section', () => {
    renderAt(<Sidebar tree={TREE} open={false} />, 'quickstart');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
