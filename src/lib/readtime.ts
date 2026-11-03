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

export function aiLevel(markdown: string): { level: AiLevel; label: string; icon: 'pen' | 'star-outline' | 'star' } {
  const text = plainText(markdown);
  const total = text.length || 1;
  // 粗略判断：常见 AI 写作痕迹（连续的「首先/其次/总而言之/因此可见」、过度整齐的排比、表情符号密度）+ 句子长度分布方差低
  const aiPhrases = (text.match(/(首先|其次|再次|最后|总而言之|综上|由此可见|不难发现|值得一提的是|与此同时)/g) || []).length;
  const emoji = (text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
  const sentences = text.split(/[。！？.!?]+/).filter((s) => s.trim().length > 4);
  const lens = sentences.map((s) => s.length);
  const mean = lens.reduce((a, b) => a + b, 0) / Math.max(lens.length, 1);
  const variance = lens.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(lens.length, 1);
  const density = aiPhrases / Math.max(sentences.length, 1);
  const emojiRate = emoji / total;

  if (aiPhrases >= 4 || emojiRate > 0.02 || (density > 0.25 && variance < 100)) {
    return { level: 'ai', label: 'AI 主笔', icon: 'star' };
  }
  if (aiPhrases >= 1 || emojiRate > 0.005) {
    return { level: 'co', label: '与 AI 合写', icon: 'star-outline' };
  }
  return { level: 'human', label: '人类手写', icon: 'pen' };
}

/** 羽毛笔 / 空心星 / 实心星 SVG（用于 AI 含量标识） */
export const aiIcons: Record<'pen' | 'star-outline' | 'star', string> = {
  pen: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.71 4.04c-.39-.39-1.02-.39-1.41 0L7.05 16.29l-1.41 4.95 4.95-1.41L21.9 7.58c.39-.39.39-1.02 0-1.41l-1.19-1.13zM3 21l1.41-4.24 2.83 2.83L3 21z"/></svg>',
  'star-outline': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l2.9 6.26L20.5 9.5l-4.75 4.63 1.12 6.37L12 17.77l-4.87 2.73 1.12-6.37L3.5 9.5l5.6-1.24L12 2z"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 2.61 6.6 1.89-4.75 4.63 1.12 6.37L12 15.77l-4.87 2.73 1.12-6.37L3.5 7.5l6.6-1.89L12 2z"/></svg>',
};
