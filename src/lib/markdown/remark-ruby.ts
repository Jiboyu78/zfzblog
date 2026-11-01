/**
 * remarkRuby：`{文字^注音}` → `<ruby>文字<rt>注音</rt></ruby>`
 *
 * 约定：
 *   - `{` 和 `^` 之间是正文（base text）
 *   - `^` 和 `}` 之间是注音（ruby text）
 *   - 必须在 remarkMath 之后运行（避免把 `$x^2$` 当 ruby）
 *
 * 例：{汉字^han4 zi4} → <ruby>汉字<rt>han4 zi4</rt></ruby>
 */
import type { Root, RootContent, Parent, PhrasingContent, Text } from 'mdast';

const RUBY_RE = /\{([^{}]+)\^([^{}]+)\}/;

export function remarkRuby() {
  return function transform(tree: Root): void {
    visit(tree);
  };
}

function visit(node: Root | RootContent): void {
  if (node.type === 'code' || node.type === 'inlineCode' || node.type === 'math' || node.type === 'inlineMath') return;
  if (!('children' in node)) return;
  const parent = node as Parent;
  const out: (RootContent | PhrasingContent)[] = [];
  for (const child of parent.children as any[]) {
    if (child.type === 'text' && RUBY_RE.test((child as Text).value)) {
      out.push(...splitRuby(child as Text));
    } else {
      visit(child);
      out.push(child);
    }
  }
  parent.children = out as any;
}

function splitRuby(node: Text): PhrasingContent[] {
  const value = node.value;
  const out: PhrasingContent[] = [];
  let rest = value;
  let m: RegExpExecArray | null;
  while ((m = RUBY_RE.exec(rest))) {
    const [full, base, rt] = m;
    const before = rest.slice(0, m.index);
    if (before) out.push({ type: 'text', value: before });
    out.push({
      type: 'html',
      value: `<ruby>${escapeHtml(base)}<rt>${escapeHtml(rt)}</rt></ruby>`,
    } as any);
    rest = rest.slice(m.index + full.length);
  }
  if (rest) out.push({ type: 'text', value: rest });
  return out;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
