/**
 * remarkSpoiler：`!!隐藏内容!!` → 默认模糊，点击 reveal。
 *
 * 输出：
 *   <span class="spoiler"><span class="spoiler-inner">隐藏内容</span></span>
 * 用 `html` 节点直接输出（remark-rehype allowDangerousHtml 已开）。
 * 交互脚本在 BaseLayout 或 post 页面注册。
 */
import type { Root, RootContent, Parent, PhrasingContent, Text } from 'mdast';

const SPOILER_RE = /!!([^!]+)!!/;

export function remarkSpoiler() {
  return function transform(tree: Root): void {
    visit(tree);
  };
}

function visit(node: Root | RootContent): void {
  if (node.type === 'code' || node.type === 'inlineCode' || node.type === 'math' || node.type === 'inlineMath') return;
  if (!('children' in node)) return;
  const parent = node as Parent;
  const out: any[] = [];
  for (const child of parent.children as any[]) {
    if (child.type === 'text' && SPOILER_RE.test((child as Text).value)) {
      out.push(...splitSpoiler(child as Text));
    } else {
      visit(child);
      out.push(child);
    }
  }
  parent.children = out;
}

function splitSpoiler(node: Text): PhrasingContent[] {
  const value = node.value;
  const out: PhrasingContent[] = [];
  let rest = value;
  let m: RegExpExecArray | null;
  while ((m = SPOILER_RE.exec(rest))) {
    const [full, inner] = m;
    const before = rest.slice(0, m.index);
    if (before) out.push({ type: 'text', value: before });
    out.push({
      type: 'html',
      value: `<span class="spoiler" tabindex="0" role="button" aria-label="点击显示隐藏内容"><span class="spoiler-inner">${escapeHtml(inner)}</span></span>`,
    } as any);
    rest = rest.slice(m.index + full.length);
  }
  if (rest) out.push({ type: 'text', value: rest });
  return out;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
