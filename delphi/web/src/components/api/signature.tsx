import type {Model} from '../../api';
import {CodeBlock} from '../mdx/code_block';

/** Props of Signature. */
export interface SignatureProps {
  model: Model;
}

function pythonSource(model: Model): string {
  const lines: string[] = [];
  let starred = false;
  for (const param of model.params) {
    if (param.kind === 'keyword_only' && !starred) {
      lines.push('    *,');
      starred = true;
    }
    const annotation = param.type ? `: ${param.type}` : '';
    const fallback = param.default !== null ? ` = ${param.default}` : '';
    lines.push(`    ${param.name}${annotation}${fallback},`);
  }
  return `class ${model.className}(\n${lines.join('\n')}\n)`;
}

/** The constructor as Python source, one parameter per line. */
export function Signature({model}: SignatureProps) {
  return (
    <CodeBlock>
      <code className="language-python">{pythonSource(model)}</code>
    </CodeBlock>
  );
}
