/**
 * @fileoverview Tests for the prose components.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';

import {CodeBlock} from './code_block';
import {ResultTable} from './result_table';
import {Description} from './table';

describe('CodeBlock', () => {
  it('copies its source', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {writeText},
      configurable: true,
    });
    render(
      <CodeBlock>
        <code className="language-python">{'x = 1\n'}</code>
      </CodeBlock>,
    );
    await user.click(screen.getByRole('button', {name: 'Copy code'}));
    expect(writeText).toHaveBeenCalledWith('x = 1');
    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent('Copied');
    });
  });
});

describe('ResultTable', () => {
  it('highlights the last row', () => {
    render(
      <ResultTable
        columns={['mean']}
        rows={[
          ['truth', '0'],
          ['recovered', '0.01'],
        ]}
      />,
    );
    expect(screen.getByText('recovered').closest('tr')).toHaveClass(
      'highlight',
    );
    expect(screen.getByText('truth').closest('tr')).not.toHaveClass(
      'highlight',
    );
  });
});

describe('Description', () => {
  it('shows a dash when empty', () => {
    const {container} = render(<Description>{''}</Description>);
    expect(container).toHaveTextContent('—');
  });
});
