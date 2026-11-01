/**
 * remarkEncrypted：把 `:::encrypted{password="xxx"}` 容器标记出来。
 *
 * 流程：
 *   1. 本插件把 directive 标记（记录密码 + title）
 *   2. remark-rehype handler 把整个块（含正文）序列化成 HTML 字符串占位
 *   3. rehypeEncrypted（rehype-encrypted.ts）找到占位 raw 节点，
 *      用 AES-GCM 加密正文 HTML，替换成带输入框的解密组件
 *
 * 输出 hast：
 *   <div class="encrypted" data-encrypted-payload="…base64…" data-encrypted-hint="…">
 *     <div class="enc-lock">🔒 …</div>
 *     <input class="enc-input" />
 *     <div class="enc-error"></div>
 *   </div>
 */
import type { Root, RootContent } from 'mdast';
import type { ContainerDirective } from 'mdast-util-directive';

export function remarkEncrypted() {
  return function transform(tree: Root): void {
    const visit = (node: Root | RootContent): void => {
      const children = 'children' in node ? (node.children as RootContent[]) : [];
      for (const child of children) {
        if (child.type === 'containerDirective') {
          const dir = child as ContainerDirective;
          if (dir.name === 'encrypted') {
            const attrs = (dir.attributes || {}) as Record<string, string>;
            const password = attrs.password || attrs.pwd || '';
            const title = attrs.title || '加密内容';
            dir.data = {
              encrypted: true,
              encPassword: password,
              encTitle: title,
            };
          }
        } else if ('children' in child) {
          visit(child);
        }
      }
    };
    // 紧凑/空行写法的 :::encrypted 已由 remarkShoka 的 expandLooseContainers 统一展开
    // （它先运行，且会把 encrypted 容器的属性解析进 dir.attributes），这里只需标记。
    visit(tree);
  };
}

/**
 * remark-rehype handler：把 encrypted directive 的正文渲染成 HTML，
 * 交给 rehypeEncrypted 消费。正文 HTML 用两个不可见 sentinel 包住，
 * rehype 阶段按 sentinel 切片取正文。
 */
export function encryptedHandler(state: any, node: any) {
  const data = node.data || {};
  if (!data.encrypted) {
    // 兜底：非 encrypted 的 containerDirective（理论上不会走到）
    return shokaFallback(state, node);
  }
  const bodyHast = state.all(node);
  // 序列化正文 hast 为 HTML 字符串
  const html = serializeHast(bodyHast);
  const result = {
    type: 'raw',
    value:
      `<!--enc-begin:${encodeURIComponent(data.encTitle || '加密内容')}:${encodeURIComponent(data.encPassword || '')}-->` +
      html +
      '<!--enc-end-->',
  };
  return result;
}

function shokaFallback(state: any, node: any) {
  const bodyHast = state.all(node);
  const result = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['shoka', 'shoka-note'] },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['shoka-head'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['shoka-icon'] },
            children: [{ type: 'text', value: '📝' }],
          },
        ],
      },
      { type: 'element', tagName: 'div', properties: { className: ['shoka-body'] }, children: bodyHast },
    ],
  };
  state.patch(node, result);
  return state.applyData(node, result);
}

/** 最小 hast→html 序列化（正文里只可能是常规 markdown 元素） */
function serializeHast(nodes: any[]): string {
  return nodes.map(serializeNode).join('');
}

function serializeNode(node: any): string {
  if (node.type === 'text') {
    return escapeHtml(node.value);
  }
  if (node.type === 'raw') {
    return node.value;
  }
  if (node.type === 'element') {
    const tag = node.tagName;
    const props = Object.entries(node.properties || {})
      .map(([k, v]) => {
        if (v === false || v == null) return '';
        if (v === true) return ` ${k}`;
        const attrName = k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        const val = Array.isArray(v) ? v.join(' ') : String(v);
        return ` ${attrName}="${escapeHtml(val)}"`;
      })
      .join('');
    const inner = (node.children || []).map(serializeNode).join('');
    const voids = new Set([
      'img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'track', 'wbr',
    ]);
    if (voids.has(tag)) return `<${tag}${props}>`;
    return `<${tag}${props}>${inner}</${tag}>`;
  }
  if (node.type === 'comment') return `<!--${node.value}-->`;
  if ('children' in node) return serializeHast(node.children);
  return '';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
