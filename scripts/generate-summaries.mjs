/**
 * R6b · 构建期生成文章摘要（本地抽取式，零依赖）
 *
 * 遍历 src/content/blog/ 所有 .md/.mdx，用 md5(正文) 做增量 key，
 * 缓存到 src/data/cache/summaries.json：
 *   { "<md5>": { "summary": "...", "generatedAt": 1234567890 } }
 * 文章页 SummariesPanel 按 md5(post.body) 查询。
 *
 * 环境变量：SKIP_SUMMARIES=1 跳过（保留既有缓存，失败时写空对象）。
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '../../');
const BLOG_DIR = join(ROOT, 'src/content/blog');
const OUT = join(ROOT, 'src/data/cache/summaries.json');

function md5(s) {
  return createHash('md5').update(s).digest('hex');
}

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

async function extractSummary(markdown, maxChars = 120) {
  const { extractSummary } = await import('../src/lib/summaries.ts');
  return extractSummary(markdown, maxChars);
}

function loadCache() {
  try {
    return JSON.parse(readFileSync(OUT, 'utf8'));
  } catch {
    return {};
  }
}

function save(cache) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(cache, null, 2) + '\n');
}

async function main() {
  const cache = loadCache();
  const files = listMarkdown(BLOG_DIR);
  let generated = 0;
  let hit = 0;

  if (process.env.SKIP_SUMMARIES === '1') {
    console.log(`[summaries] SKIP_SUMMARIES=1，跳过生成（缓存 ${Object.keys(cache).length} 条保留）`);
    save(cache);
    return;
  }

  for (const file of files) {
    const raw = readFileSync(file, 'utf8');
    try {
      const key = md5(raw);
      if (cache[key]?.summary) {
        hit++;
        continue;
      }
      const summary = await extractSummary(raw, 120);
      cache[key] = { summary, generatedAt: Date.now() };
      generated++;
    } catch (err) {
      console.error(`[summaries] 生成失败 ${file}:`, err?.message ?? err);
    }
  }

  try {
    save(cache);
    console.log(
      `[summaries] 完成：${files.length} 篇，新增 ${generated}，缓存命中 ${hit}，缓存总量 ${Object.keys(cache).length}`
    );
  } catch (err) {
    console.error('[summaries] 写缓存失败，写空对象兜底:', err?.message ?? err);
    try {
      writeFileSync(OUT, '{}\n');
    } catch {}
  }
}

main();
