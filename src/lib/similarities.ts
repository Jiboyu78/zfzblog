/**
 * R6c · 本地 TF-IDF 余弦相似度（零依赖，替代 transformers.js）
 *
 * 说明：
 *   - 语料为正文纯文本（经 stripMarkdown 剥离 frontmatter/代码/HTML/图片）；
 *   - 分词复用 summaries.ts 的 tokenize（中文 2-gram + 英文/数字单词）；
 *   - TF 用 0.5 + 0.5 * (f / max f) 归一化，IDF 用 log((N+1)/(df+1)) + 1；
 *   - 余弦相似度，取每篇 Top-K，过滤低于 minScore 的噪声。
 *
 * 这样既有「语义相近」的排序效果，又完全本地、可重复、构建期秒级完成，
 * 不引入 25MB 级模型文件。
 */

import { stripMarkdown, tokenize } from './summaries.ts';

export interface SimilarityInput {
  /** 文章 id（对应 content collection 的 id） */
  id: string;
  /** 正文原文（含 frontmatter 也没关系，会再 strip 一次） */
  body: string;
}

export interface SimilarityEntry {
  id: string;
  score: number; // 0..1，保留 4 位小数
}

/** 文档向量：term -> tf-idf 权重 */
type Vector = Map<string, number>;

function buildVectors(docs: SimilarityInput[]): Vector[] {
  const tokenized = docs.map((d) => tokenize(stripMarkdown(d.body)));
  const N = docs.length;
  // df：每个 term 在多少篇文档中出现
  const df = new Map<string, number>();
  for (const tokens of tokenized) {
    const seen = new Set(tokens);
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  return tokenized.map((tokens) => {
    if (tokens.length === 0) return new Map();
    const counts = new Map<string, number>();
    let maxF = 0;
    for (const t of tokens) {
      const c = (counts.get(t) ?? 0) + 1;
      counts.set(t, c);
      if (c > maxF) maxF = c;
    }
    const vec: Vector = new Map();
    for (const [t, f] of counts) {
      const idf = Math.log((N + 1) / ((df.get(t) ?? 0) + 1)) + 1;
      const tfNorm = 0.5 + (0.5 * f) / maxF;
      vec.set(t, tfNorm * idf);
    }
    return vec;
  });
}

function cosine(a: Vector, b: Vector): number {
  if (a.size === 0 || b.size === 0) return 0;
  // 遍历较小的向量
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [t, w] of small) {
    const w2 = large.get(t);
    if (w2 !== undefined) dot += w * w2;
  }
  let na = 0;
  for (const w of a.values()) na += w * w;
  let nb = 0;
  for (const w of b.values()) nb += w * w;
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * 计算每篇文章的 Top-K 相似文章。
 * @param docs 全部文章
 * @param topK 每篇保留的相似条数（默认 5）
 * @param minScore 低于该分数的推荐丢弃（默认 0.03，避免把不相关的也塞进去）
 */
export function computeSimilarities(
  docs: SimilarityInput[],
  topK = 5,
  minScore = 0.03
): Record<string, SimilarityEntry[]> {
  const vecs = buildVectors(docs);
  const out: Record<string, SimilarityEntry[]> = {};
  for (let i = 0; i < docs.length; i++) {
    const scores: SimilarityEntry[] = [];
    for (let j = 0; j < docs.length; j++) {
      if (i === j) continue;
      const s = cosine(vecs[i], vecs[j]);
      if (s >= minScore) {
        scores.push({ id: docs[j].id, score: Number(s.toFixed(4)) });
      }
    }
    scores.sort((a, b) => b.score - a.score);
    out[docs[i].id] = scores.slice(0, topK);
  }
  return out;
}
