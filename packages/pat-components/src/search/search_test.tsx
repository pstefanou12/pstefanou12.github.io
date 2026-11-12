/**
 * @fileoverview Tests for the navbar search.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';

import {TREE} from '../testing/fixtures';
import {renderAt} from '../testing/render';
import {Search} from './search';

describe('Search', () => {
  it('lists matches and opens the highlighted one on Enter', async () => {
    const user = userEvent.setup();
    renderAt(<Search tree={TREE} />);
    await user.type(screen.getByRole('searchbox'), 'normal');
    expect(screen.getAllByRole('option')).toHaveLength(2);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/coarsened-normal',
    );
  });

  it('says so when nothing matches', async () => {
    const user = userEvent.setup();
    renderAt(<Search tree={TREE} />);
    await user.type(screen.getByRole('searchbox'), 'zeta');
    expect(screen.getByText(/No pages match/)).toBeInTheDocument();
  });

  it('focuses on Ctrl+K', async () => {
    const user = userEvent.setup();
    renderAt(<Search tree={TREE} />);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('searchbox')).toHaveFocus();
  });
});
