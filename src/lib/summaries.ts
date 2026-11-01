/**
 * R6b · 本地抽取式 AI 摘要（零依赖、可离线）
 *
 * 算法（TF-IDF / TextRank 风格抽取）：
 *   1. stripMarkdown：剥离 frontmatter / 代码块 / HTML / 图片 / 公式块等噪音
 *   2. 分句（按 。！？.!? ；;:： 等断点，并保留句尾标点）
 *   3. tokenize：中文 2-gram + 英文/数字单词 + 常见停用词过滤
 *   4. 句子打分：词频 TF + 位置加权（首句 ×1.6、前三句 ×1.3）+ 长度惩罚
 *   5. 取 Top-N 句按原文序拼接，贪心截断到 maxChars（默认 120 字）
 *
 * 设计目标：
 *   - 纯 TypeScript、无外部依赖，可在 Astro 构建脚本（node）中直接运行；
 *   - 可重复：相同输入永远输出相同摘要（配合内容 md5 做增量缓存）。
 */

/** 常见中文/英文停用词（摘要评分时过滤） */
const STOP_WORDS = new Set([
  // 中文
  '的', '了', '在', '是', '我', '你', '他', '她', '它', '们', '这', '那', '有', '和', '与', '或',
  '及', '等', '不', '就', '都', '而', '也', '又', '被', '把', '让', '向', '从', '到', '对', '为',
  '以', '于', '但', '却', '如', '若', '因', '所以', '因为', '如果', '虽然', '一个', '一些', '什么',
  '怎么', '这样', '那样', '这里', '那里', '我们', '你们', '他们', '可以', '没有', '这个', '那个',
  // 英文高频
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'in', 'on', 'at', 'to', 'of', 'for', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'it', 'this', 'that', 'these', 'those', 'as', 'from',
]);

/**
 * 剥离 Markdown 噪音，返回纯文本正文。
 * 依次处理：frontmatter → 代码块 → HTML → 图片 → 公式块 → 链接/Directive → 标记符号。
 */
export function stripMarkdown(markdown: string): string {
  let s = markdown;
  // 1. frontmatter
  s = s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  // 2. 围栏代码块 ``` ... ```
  s = s.replace(/```[\s\S]*?```/g, ' ');
  // 3. 行内代码 `code`
  s = s.replace(/`[^`\n]*`/g, ' ');
  // 4. $$...$$ 块级公式
  s = s.replace(/\$\$[\s\S]*?\$\$/g, ' ');
  // 5. $...$ 行内公式
  s = s.replace(/\$[^$\n]*\$/g, ' ');
  // 6. 图片 ![alt](url)
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  // 7. 链接 [text](url) → 保留 text
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  // 8. HTML 标签
  s = s.replace(/<[^>]+>/g, ' ');
  // 9. Shoka 容器 / directive 标记 :::tip / :::
  s = s.replace(/^\s*:::?.*$/gm, ' ');
  // 10. 标题、引用、列表标记
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  s = s.replace(/^\s{0,3}>\s?/gm, '');
  s = s.replace(/^\s*[-*+]\s+/gm, '');
  s = s.replace(/^\s*\d+\.\s+/gm, '');
  // 11. 表格分隔行 |---|---|
  s = s.replace(/^\s*\|?[\s\-:|]+\|?\s*$/gm, ' ');
  // 12. 强调 / 删除线 / 高亮标记 ** __ * _ ~~ ++ == ^ ~（保留文字）
  s = s.replace(/(\*\*|__|\*|_|~~|\+\+|==|\^|~)/g, '');
  // 13. 多余空白
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\n{2,}/g, '\n');
  return s.trim();
}

/**
 * 分词：中文按 2-gram 滑动窗口，英文/数字按单词。
 * 过滤停用词、单字符英文、纯标点。
 */
export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  // 英文/数字单词
  const enWords = text.toLowerCase().match(/[a-z0-9][a-z0-9_\-+#.]*/g) ?? [];
  for (const w of enWords) {
    if (w.length > 1 && !STOP_WORDS.has(w)) tokens.push(w);
  }
  // 中文 2-gram
  const cjk = text.replace(/[^\u4e00-\u9fa5]/g, '');
  for (let i = 0; i < cjk.length - 1; i++) {
    const bigram = cjk.slice(i, i + 2);
    // 两个都是停用字的 2-gram 价值低，但仍保留（位置加权会拉平影响）
    tokens.push(bigram);
  }
  return tokens;
}

/** 句末标点 */
const SENTENCE_END = /[。！？!?；;：:]/;

/** 把纯文本切成句子（保留句尾标点，空句丢弃） */
function splitSentences(text: string): string[] {
  const raw = text
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const sentences: string[] = [];
  for (const line of raw) {
    let start = 0;
    for (let i = 0; i < line.length; i++) {
      if (SENTENCE_END.test(line[i])) {
        const seg = line.slice(start, i + 1).trim();
        if (seg) sentences.push(seg);
        start = i + 1;
      }
    }
    const tail = line.slice(start).trim();
    if (tail) sentences.push(tail);
  }
  return sentences.filter((s) => s.replace(/[\s\p{P}]/gu, '').length > 0);
}

interface ScoredSentence {
  text: string;
  index: number; // 原文顺序
  score: number;
  /** 有效字数（去标点/空白） */
  chars: number;
}

/**
 * 抽取式摘要：返回拼接后的摘要文本（≤ maxChars）。
 * 没有有效句子时回落到纯文本前 maxChars 字。
 */
export function extractSummary(markdown: string, maxChars = 120): string {
  const plain = stripMarkdown(markdown);
  if (!plain) return '';
  const sentences = splitSentences(plain);
  if (sentences.length === 0) {
    return truncate(plain.replace(/\s+/g, ''), maxChars);
  }

  // 全文词频（TF）
  const tf = new Map<string, number>();
  for (const s of sentences) {
    for (const t of tokenize(s)) tf.set(t, (tf.get(t) ?? 0) + 1);
  }

  const scored: ScoredSentence[] = sentences.map((text, index) => {
    const tokens = tokenize(text);
    // 基础分：句子内所有词频之和，除以 √(句长) 抑制超长句
    const raw = tokens.reduce((acc, t) => acc + (tf.get(t) ?? 0), 0);
    const norm = raw / Math.sqrt(Math.max(tokens.length, 1));
    // 位置加权
    let weight = 1;
    if (index === 0) weight = 1.6;
    else if (index < 3) weight = 1.3;
    // 长度惩罚：过短句（<6 有效字）几乎不贡献，超长句略降
    const chars = text.replace(/[\s\p{P}]/gu, '').length;
    let lenPenalty = 1;
    if (chars < 6) lenPenalty = 0.2;
    else if (chars > 120) lenPenalty = 0.85;
    return { text, index, score: norm * weight * lenPenalty, chars };
  });

  // 贪心：按分数从高到低取句，按原文序重排拼接
  const picked: ScoredSentence[] = [];
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  let used = 0;
  for (const s of sorted) {
    if (picked.length >= 3) break; // 最多 3 句
    if (used + s.chars > maxChars && picked.length > 0) continue;
    picked.push(s);
    used += s.chars;
    if (used >= maxChars) break;
  }
  if (picked.length === 0) {
    // 兜底：第一句截断
    return truncate(sentences[0], maxChars);
  }
  picked.sort((a, b) => a.index - b.index);
  const joined = picked.map((p) => p.text).join('');
  return truncate(joined, maxChars);
}

/** 按字符截断，尽量落在词/标点边界，并补省略号 */
function truncate(text: string, maxChars: number): string {
  const clean = text.replace(/\s+/g, '');
  if (clean.length <= maxChars) return clean;
  let cut = clean.slice(0, maxChars);
  // 尝试在最后一个标点处截断
  const lastPunct = Math.max(
    cut.lastIndexOf('。'), cut.lastIndexOf('！'), cut.lastIndexOf('？'),
    cut.lastIndexOf('，'), cut.lastIndexOf('、'), cut.lastIndexOf('；'),
    cut.lastIndexOf('.'), cut.lastIndexOf(',')
  );
  if (lastPunct > maxChars * 0.5) cut = cut.slice(0, lastPunct + 1);
  // 若结尾不是终止标点，补 …
  if (!/[。！？!?…]$/.test(cut)) cut = cut.replace(/[，、；：,;:\s]+$/, '') + '…';
  return cut;
}
