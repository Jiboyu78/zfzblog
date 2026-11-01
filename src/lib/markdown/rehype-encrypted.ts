/**
 * rehypeEncrypted：找到 remarkEncrypted + remark-rehype handler 生成的
 * sentinel raw 节点，把其中的正文 HTML 用 AES-GCM 加密，
 * 替换成客户端解密组件。
 *
 * 注意：这是「防君子不防小人」级别——密钥明文保存在 HTML 的 data-encrypted 属性里，
 * 客户端解密是公开的。不是真安全，只是避免 spoilers/隐私内容一眼被看到。
 */
import { createHash, randomBytes, createCipheriv } from 'node:crypto';
import type { Root, RootContent } from 'hast';

/** 用密码派生 AES 密钥（PBKDF2） */
function deriveKey(password: string, salt: Buffer): Buffer {
  // 快速派生（salt 也是随机的，不追求抗字典，够用）
  return createHash('sha256').update(Buffer.concat([salt, Buffer.from(password, 'utf8')])).digest();
}

/** AES-GCM 加密，返回 base64(iv + cipher + tag) */
function encrypt(plaintext: string, password: string): string {
  const salt = randomBytes(16);
  const key = deriveKey(password, salt);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, encrypted, tag]).toString('base64');
}

/**
 * 客户端解密说明：
 * - payload 布局：salt(16) + iv(12) + ciphertext + tag(16)，base64 编码
 * - key = SHA-256(salt + password)
 * - 防君子不防小人：密码明文可从 data 属性推导，不要放真敏感内容
 */
export function rehypeEncrypted() {
  return function transform(tree: Root): void {
    walk(tree);
  };
}

function walk(node: Root | RootContent): void {
  if (!('children' in node) || !node.children) return;
  const children = node.children as RootContent[];
  const out: RootContent[] = [];
  for (const child of children) {
    if (child.type === 'raw' && typeof child.value === 'string' && child.value.includes('<!--enc-begin:')) {
      // 格式：<!--enc-begin:<title-uri>:<password-uri>-->…html…<!--enc-end-->
      const m = child.value.match(/<!--enc-begin:([^:]*):([^>]*)-->([\s\S]*)<!--enc-end-->/);
      if (m) {
        const title = decodeURIComponent(m[1] || '加密内容');
        const password = decodeURIComponent(m[2] || '');
        const html = m[3];
        const payload = password ? encrypt(html, password) : html;
        out.push({
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['encrypted'],
            'data-encrypted-payload': payload,
            'data-encrypted-title': title,
          },
          children: [
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['enc-lock'] },
              children: [
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['enc-icon'] },
                  children: [{ type: 'text', value: '🔒' }],
                },
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['enc-title'] },
                  children: [{ type: 'text', value: title }],
                },
                {
                  type: 'element',
                  tagName: 'span',
                  properties: { className: ['enc-note'] },
                  children: [
                    { type: 'text', value: ' · 防君子不防小人' },
                  ],
                },
              ],
            },
            {
              type: 'element',
              tagName: 'div',
              properties: { className: ['enc-body'] },
              children: [
                {
                  type: 'element',
                  tagName: 'input',
                  properties: {
                    className: ['enc-input'],
                    type: 'password',
                    placeholder: '输入密码查看内容',
                  },
                },
                {
                  type: 'element',
                  tagName: 'button',
                  properties: { className: ['enc-btn'], type: 'button' },
                  children: [{ type: 'text', value: '解密' }],
                },
                {
                  type: 'element',
                  tagName: 'div',
                  properties: { className: ['enc-error'], role: 'alert' },
                  children: [],
                },
              ],
            },
          ],
        } as RootContent);
        continue;
      }
    }
    if ('children' in child && child.children) {
      walk(child);
    }
    out.push(child);
  }
  node.children = out;
}
