/**
 * remarkInlineEffects：行内效果语法
 *   `++下划线++` → <u>…</u>（不依赖 GFM 原生 underline）
 *   `==高亮==`   → <mark>…</mark>
 *   `~下标~`     → <sub>…</sub>（GFM strikethrough 用 ~~，单 ~ 留给 sub）
 *   `^上标^`     → <sup>…</sup>
 *
 * 注意：必须在 remarkMath 之后运行，避免 `$x^2$` 被吃掉。
 * 解析顺序按「最不冲突」原则：== 最不容易误伤，先解析；^ 和 ~ 最后。
 */
import type { Root, RootContent, Parent, PhrasingContent, Text } from 'mdast';

interface Rule {
  re: RegExp;
  tag: 'u' | 'mark' | 'sub' | 'sup';
}

// 按优先级排列
const RULES: Rule[] = [
  { re: /==([^=\n]+)==/, tag: 'mark' },
  { re: /\+\+([^+\n]+)\+\+/, tag: 'u' },
  { re: /(?<![\w~])~([^~\n]+)~(?![\w~])/, tag: 'sub' },
  { re: /(?<![\w^])\^([^\^\n]+)\^(?![\w^])/, tag: 'sup' },
];

export function remarkInlineEffects() {
  return function transform(tree: Root): void {
    visit(tree);
  };
}

function visit(node: Root | RootContent): void {
  if (node.type === 'code' || node.type === 'inlineCode' || node.type === 'math' || node.type === 'inlineMath') return;
  if (!('children' in node)) return;
  const parent = node as Parent;
  let changed = true;
  // 多轮直到所有规则都不再命中（规则间可能互相干扰）
  while (changed) {
    changed = false;
    const out: any[] = [];
    for (const child of parent.children as any[]) {
      if (child.type === 'text') {
        const result = splitRules(child as Text);
        if (result.replaced) changed = true;
        out.push(...result.nodes);
      } else {
        visit(child);
        out.push(child);
      }
    }
    parent.children = out;
  }
}

function splitRules(node: Text): { nodes: PhrasingContent[]; replaced: boolean } {
  const out: PhrasingContent[] = [];
  let rest = node.value;
  let replaced = false;

  outer: while (rest.length > 0) {
    for (const { re, tag } of RULES) {
      const m = re.exec(rest);
      if (m && m.index === 0) {
        out.push({ type: 'html', value: `<${tag}>${escapeHtml(m[1])}</${tag}>` } as any);
        rest = rest.slice(m[0].length);
        replaced = true;
        continue outer;
      }
    }
    // 不匹配：取到下一个可能匹配的位置
    let next = rest.length;
    for (const { re } of RULES) {
      const m = re.exec(rest);
      if (m && m.index < next) next = m.index;
    }
    if (next >= rest.length) {
      out.push({ type: 'text', value: rest });
      break;
    }
    if (next === 0) {
      // 没有规则从这里匹配，向前推进一个字符
      out.push({ type: 'text', value: rest[0] });
      rest = rest.slice(1);
    } else {
      out.push({ type: 'text', value: rest.slice(0, next) });
      rest = rest.slice(next);
    }
  }
  return { nodes: out, replaced };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
