/**
 * R6c · 构建期生成语义相似推荐（TF-IDF 词袋余弦相似度，零依赖）
 *
 * 遍历 src/content/blog/ 所有非草稿文章，计算每篇 Top-5 相似，
 * 产物 src/data/cache/similarities.json：
 *   { "<postId>": [{ "id": "<postId>", "score": 0.87 }, ...] }
 *
 * 环境变量：SKIP_SIMILARITIES=1 跳过（写空对象，但保留既有缓存）。
 * 任何失败都会写空对象兜底，不阻塞构建。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '../../');
const BLOG_DIR = join(ROOT, 'src/content/blog');
const OUT = join(ROOT, 'src/data/cache/similarities.json');

function listMarkdown(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...listMarkdown(p));
    else if (/\.mdx?$/.test(name.name)) out.push(p);
  }
  return out;
}

function postIdOf(file) {
  return basename(file).replace(/\.mdx?$/, '');
}

function isDraft(raw) {
  const m = raw.match(/^---([\s\S]*?)---/);
  if (!m) return false;
  return /^draft:\s*true\s*$/m.test(m[1]);
}

function writeEmpty(reason) {
  try {
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, '{}\n');
    console.log(`[similarities] ${reason}，已写空对象`);
  } catch (err) {
    console.error('[similarities] 写空对象也失败：', err?.message ?? err);
  }
}

async function main() {
  const prev = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';

  if (process.env.SKIP_SIMILARITIES === '1') {
    console.log('[similarities] SKIP_SIMILARITIES=1，跳过计算（保留既有缓存）');
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, prev && prev.trim() ? prev : '{}\n');
    return;
  }

  try {
    const files = listMarkdown(BLOG_DIR);
    const docs = [];
    for (const file of files) {
      const raw = readFileSync(file, 'utf8');
      if (isDraft(raw)) continue;
      docs.push({ id: postIdOf(file), body: raw });
    }
    if (docs.length === 0) {
      writeEmpty('没有可计算的文章');
      return;
    }
    const { computeSimilarities } = await import('../src/lib/similarities.ts');
    const map = computeSimilarities(docs, 5);
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(map, null, 2) + '\n');
    const counts = docs.map((d) => (map[d.id] ?? []).length);
    console.log(
      `[similarities] 完成：${docs.length} 篇，每篇推荐数 min=${Math.min(...counts)} max=${Math.max(...counts)}`
    );
  } catch (err) {
    console.error('[similarities] 计算失败：', err?.message ?? err);
    writeEmpty('计算失败');
  }
}

main();
