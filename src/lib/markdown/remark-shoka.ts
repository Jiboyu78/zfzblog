/**
 * remarkShoka：把 remark-directive 产出的 containerDirective 转成 Shoka 容器。
 *
 * 语法：
 *   :::tip 标题
 *   正文（可含任意 markdown）
 *   :::
 *
 * 渲染结果：
 *   <div class="shoka shoka-tip"><div class="shoka-head">…</div><div class="shoka-body">…</div></div>
 *   <details class="shoka shoka-details"><summary class="shoka-head">…</summary><div class="shoka-body">…</div></details>
 *
 * 正文递归 mdast→hast 需要一个 remark-rehype 自定义 handler
 * （见 astro.config.mjs 的 remarkRehype.handlers.containerDirective）。
 *
 * `:::encrypted{password="x"}` 不在此处处理——交给 remarkEncrypted。
 */
import type { Root, RootContent, Paragraph } from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';
import type { ElementContent, Properties } from 'hast';
import { encryptedHandler } from './remark-encrypted.ts';

/**
 * 预处理：micromark-extension-directive 要求「容器起始行与正文之间必须有空行」，
 * 否则 :::type 标题\\n正文\\n::: 会被整段吞成一个 paragraph 纯文本。
 * 这里在 remark-parse 之后、任何消费插件之前，把这种「未展开的容器段落」
 * 手动拆成 containerDirective 节点，从而兼容常见的紧凑写法。
 */
function expandLooseContainers(tree: Root): void {
  const visit = (node: any): void => {
    if (!Array.isArray(node.children)) return;
    const out: any[] = [];
    // micromark 把「:::type 标题\\n\\n正文\\n\\n:::」拆成 3 个 paragraph：
    //   [0] ':::type 标题'  [1] '正文'  [2] ':::'
    // 也可能把紧凑写法吞成单段落。这里做状态机合并。
    let i = 0;
    while (i < node.children.length) {
      const child = node.children[i];
      // 起始：单文本段落，以 :::type 开头（不是仅 :::）
      if (
        child?.type === 'paragraph' &&
        child.children?.length === 1 &&
        child.children[0].type === 'text' &&
        /^:::[A-Za-z]+/.test(child.children[0].value)
      ) {
        const openText: string = child.children[0].value;
        const openM = openText.match(/^:::([A-Za-z]+)(?:[ \t]+(.*))?$/);
        if (openM) {
          const [, name, titleInline = ''] = openM;
          // 收集后续段落直到遇到仅含 ::: 的段落
          const bodyTexts: string[] = [];
          let j = i + 1;
          let closed = false;
          while (j < node.children.length) {
            const sib = node.children[j];
            const txt =
              sib?.type === 'paragraph' && sib.children?.length === 1 && sib.children[0].type === 'text'
                ? sib.children[0].value
                : null;
            if (txt !== null && /^:::[ \t]*$/.test(txt.trim())) { closed = true; break; }
            // 遇到非纯文本段落，或遇到新的 :::type 开头（上一个没闭合）就停
            if (txt === null) break;
            if (/^:::[A-Za-z]+/.test(txt)) break;
            bodyTexts.push(txt);
            j++;
          }
          if (closed) {
            const dir: any = { type: 'containerDirective', name, attributes: {}, children: [] };
            // 解析属性 :::encrypted{...}
            const attrMatch = (titleInline || '').match(/^\{([^}]*)\}/);
            let title = (titleInline || '').trim();
            if (attrMatch) {
              const attrRe = /([A-Za-z]+)="([^"]*)"/g;
              let am: RegExpExecArray | null;
              while ((am = attrRe.exec(attrMatch[1]))) dir.attributes[am[1]] = am[2];
              title = title.replace(attrMatch[0], '').trim();
            }
            if (title) {
              dir.children.push({
                type: 'paragraph',
                data: { directiveLabel: true },
                children: [{ type: 'text', value: title }],
              });
            }
            for (const para of bodyTexts.join('\n\n').split(/\n{2,}/).map(s=>s.trim()).filter(Boolean)) {
              dir.children.push({ type: 'paragraph', children: [{ type: 'text', value: para }] });
            }
            out.push(dir);
            i = j + 1; // 跳过闭合 :::
            continue;
          }
        }
      }
      visit(child);
      out.push(child);
      i++;
    }
    node.children = out;
  };
  visit(tree);
}

export const SHOKA_TYPES = ['tip', 'info', 'warning', 'danger', 'note', 'quote', 'details'] as const;

const META: Record<string, { icon: string; label: string }> = {
  tip: { icon: '💡', label: 'TIP' },
  info: { icon: 'ℹ️', label: 'INFO' },
  warning: { icon: '⚠️', label: 'WARNING' },
  danger: { icon: '⛔', label: 'DANGER' },
  note: { icon: '📝', label: 'NOTE' },
  quote: { icon: '❝', label: 'QUOTE' },
  details: { icon: '▸', label: '详情' },
};

function el(
  tagName: string,
  properties: Properties,
  children: ElementContent[]
): ElementContent {
  return { type: 'element', tagName, properties, children };
}

export function remarkShoka() {
  return function transform(tree: Root): void {
    // 先把「未展开的紧凑容器段落」展开成 containerDirective
    expandLooseContainers(tree);
    const visit = (node: Root | RootContent): void => {
      const children = 'children' in node ? (node.children as RootContent[]) : [];
      for (const child of children) {
        if (child.type === 'containerDirective') {
          const dir = child as ContainerDirective;
          const name = dir.name;
          if ((SHOKA_TYPES as readonly string[]).includes(name)) {
            const meta = META[name];
            const [first, ...rest] = dir.children;
            let titleText = meta.label;
            if (first?.type === 'paragraph') {
              const d = first.data as { directiveLabel?: boolean } | undefined;
              if (d?.directiveLabel) {
                const t = first.children
                  .map((c) => (c.type === 'text' ? c.value : ''))
                  .join('')
                  .trim();
                if (t) titleText = t;
                dir.children = rest;
              }
            }
            const head = el(
              'div',
              { className: ['shoka-head'] },
              [
                el('span', { className: ['shoka-icon'] }, [
                  { type: 'text', value: meta.icon },
                ]),
                el('span', { className: ['shoka-title'] }, [
                  { type: 'text', value: titleText },
                ]),
              ]
            );
            // 标记给 remark-rehype handler 使用
            dir.data = {
              shoka: true,
              shokaName: name,
              shokaHead: head,
            };
          }
        } else if ('children' in child) {
          visit(child);
        }
      }
    };
    visit(tree);
  };
}

/**
 * remark-rehype handler：containerDirective → hast element。
 * 在 astro.config.mjs 里注册：remarkRehype: { handlers: { containerDirective: shokaHandler } }
 * encrypted 容器交给 rehypeEncrypted 处理（返回 sentinel raw，rehype 阶段替换）。
 */
export function shokaHandler(state: any, node: any) {
  const data = node.data || {};
  if (data.encrypted) {
    // 让 rehypeEncrypted 去处理（静态导入避免 require）
    return encryptedHandler(state, node);
  }
  const name = data.shokaName || node.name || 'note';
  const head = data.shokaHead || {
    type: 'element',
    tagName: 'div',
    properties: { className: ['shoka-head'] },
    children: [],
  };
  const bodyHast = state.all(node);
  const body = el('div', { className: ['shoka-body'] }, bodyHast);
  let result: ElementContent;
  if (name === 'details') {
    result = {
      type: 'element',
      tagName: 'details',
      properties: { className: ['shoka', 'shoka-details'] },
      children: [{ ...head, tagName: 'summary' }, body],
    };
  } else {
    result = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['shoka', `shoka-${name}`] },
      children: [head, body],
    };
  }
  state.patch(node, result);
  return state.applyData(node, result);
}
