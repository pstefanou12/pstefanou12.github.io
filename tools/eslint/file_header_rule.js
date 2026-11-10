/**
 * @fileoverview ESLint rule: every source file opens with the house header,
 * a JSDoc block with an @fileoverview, the copyright line and the author.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

'use strict';

const REQUIRED = [
  {pattern: /@fileoverview \S/, label: '@fileoverview <description>'},
  {
    pattern: /Copyright \d{4} Delphi Tech\. All Rights Reserved\./,
    label: 'Copyright <year> Delphi Tech. All Rights Reserved.',
  },
  {pattern: /Author: [\w-]+@/, label: 'Author: <github handle>@'},
];

const TEMPLATE = [
  '/**',
  ' * @fileoverview <one line on what this file is>.',
  ` * Copyright ${new Date().getFullYear()} Delphi Tech. All Rights Reserved.`,
  ' * Author: pstefanou12@',
  ' */',
].join('\n');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {description: 'Require the file header from CLAUDE.md.'},
    messages: {
      missing: 'The file must open with the header block:\n{{template}}',
      incomplete: 'The file header is missing: {{missing}}.',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const source = context.sourceCode;
        const first = source.getAllComments()[0];
        const opensFile =
          first &&
          first.type === 'Block' &&
          first.value.startsWith('*') &&
          source.text.slice(0, first.range[0]).trim() === '';
        if (!opensFile) {
          context.report({
            node,
            messageId: 'missing',
            data: {template: TEMPLATE},
          });
          return;
        }
        const missing = REQUIRED.filter(r => !r.pattern.test(first.value));
        if (missing.length) {
          context.report({
            loc: first.loc,
            messageId: 'incomplete',
            data: {missing: missing.map(r => r.label).join('; ')},
          });
        }
      },
    };
  },
};
