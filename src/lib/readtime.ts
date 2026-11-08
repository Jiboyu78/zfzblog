/**
 * 阅读时间 / 字数 / AI 创作标签 —— 单一计算源
 *
 * 文章列表卡片和详情页都从这里取，避免两处算法不一致。
 */

/** 剥离 frontmatter / 代码块 / 图片 / HTML 后的纯文本 */
function plainText(markdown: string): string {
  return markdown
    .replace(/^---[\s\S]*?---/, '')           // frontmatter
    .replace(/```[\s\S]*?```/g, ' ')           // 围栏代码块
    .replace(/`[^`]+`/g, ' ')                  // 行内代码
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' ')   // 图片
    .replace(/<[^>]+>/g, ' ')                  // HTML 标签
    .replace(/[#>*_~=\-|[\](){}\^]/g, ' ')     // markdown 语法符号
    .replace(/\s+/g, ' ')
    .trim();
}

/** 字数：中文按字符、英文按单词，合计 */
export function wordCount(markdown: string): number {
  const text = plainText(markdown);
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const en = (text.match(/[a-zA-Z]+/g) || []).length;
  return cjk + en;
}

/** 阅读时间（分钟）：中文约 400 字/分钟，英文约 200 词/分钟 */
export function readMinutes(markdown: string): number {
  const text = plainText(markdown);
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const en = (text.match(/[a-zA-Z]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + en / 200));
}

/** AI 创作标签：人类手写 / 与 AI 合写 / AI 主笔 */
export type AiLevel = 'human' | 'co' | 'ai';

const AI_LABELS: Record<AiLevel, { label: string; icon: 'pen' | 'star-outline' | 'star' }> = {
  human: { label: '人类手写', icon: 'pen' },
  co: { label: '与 AI 合写', icon: 'star-outline' },
  ai: { label: 'AI 主笔', icon: 'star' },
};

/**
 * AI 创作标签改为写作后台手动标注（frontmatter `aiTag` 字段），
 * 不再根据正文内容自动猜测。缺省按「人类手写」处理。
 */
export function aiTagInfo(tag: AiLevel = 'human'): { level: AiLevel; label: string; icon: 'pen' | 'star-outline' | 'star' } {
  const info = AI_LABELS[tag] ?? AI_LABELS.human;
  return { level: tag in AI_LABELS ? tag : 'human', ...info };
}

/** 羽毛笔 / 空心星 / 实心星 SVG（用于 AI 含量标识） */
export const aiIcons: Record<'pen' | 'star-outline' | 'star', string> = {
  pen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.71 4.04c-.39-.39-1.02-.39-1.41 0L7.05 16.29l-1.41 4.95 4.95-1.41L21.9 7.58c.39-.39.39-1.02 0-1.41l-1.19-1.13zM3 21l1.41-4.24 2.83 2.83L3 21z"/></svg>',
  'star-outline': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l2.9 6.26L20.5 9.5l-4.75 4.63 1.12 6.37L12 17.77l-4.87 2.73 1.12-6.37L3.5 9.5l5.6-1.24L12 2z"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 2.61 6.6 1.89-4.75 4.63 1.12 6.37L12 15.77l-4.87 2.73 1.12-6.37L3.5 7.5l6.6-1.89L12 2z"/></svg>',
};
