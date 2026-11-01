// 资源完整性检查：找出所有 404 的内部链接与静态资源引用
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = './dist';
const problems = [];

// 收集所有产出文件
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
console.log(`扫描 ${htmlFiles.length} 个 HTML 文件...`);

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '/');

  // 内部链接
  const links = [...html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)].map((m) => m[1]);
  for (const link of new Set(links)) {
    if (link.startsWith('//')) continue;
    // URL 解码：中文标签在磁盘上是原始中文名，链接里是百分号编码
    let decoded = link;
    try { decoded = decodeURIComponent(link); } catch { /* 保持原样 */ }
    const target = join(DIST, decoded.replace(/^\//, ''));
    const candidates = [
      target,
      join(target, 'index.html'),
      target + '.html',
    ];
    if (!candidates.some((c) => existsSync(c))) {
      problems.push(`[死链] ${page} → ${link}`);
    }
  }

  // 页面内锚点
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  const anchors = [...html.matchAll(/href="\/[^"#]*#([^"]+)"/g)].map((m) => m[1]);
  for (const a of new Set(anchors)) {
    if (!ids.has(a)) problems.push(`[锚点失效] ${page} → #${a}`);
  }
}

// 检查 HTML 里的相对资源（非绝对路径）
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const rel = [...html.matchAll(/(?:href|src)="(?!https?:|\/|#|data:|mailto:)([^"]+)"/g)].map((m) => m[1]);
  const dir = join(file, '..');
  for (const r of new Set(rel)) {
    if (!existsSync(join(dir, r))) {
      problems.push(`[相对资源缺失] ${relative(DIST, file)} → ${r}`);
    }
  }
}

console.log('\n===== 检查结果 =====');
if (problems.length === 0) {
  console.log('✓ 无死链、无锚点失效、无资源缺失');
} else {
  const uniq = [...new Set(problems)];
  uniq.forEach((p) => console.log(p));
  console.log(`\n共 ${uniq.length} 个问题`);
}

// 统计体积
const sizes = files.map((f) => ({ f, s: statSync(f).size }));
const total = sizes.reduce((a, b) => a + b.s, 0);
const css = sizes.filter((x) => x.f.endsWith('.css'));
const js = sizes.filter((x) => x.f.endsWith('.js'));
const html = sizes.filter((x) => x.f.endsWith('.html'));

console.log('\n===== 体积统计 =====');
console.log(`总计:      ${(total / 1024).toFixed(0)} KB`);
console.log(`HTML:     ${(html.reduce((a, b) => a + b.s, 0) / 1024).toFixed(0)} KB (${html.length} 个)`);
console.log(`CSS:      ${(css.reduce((a, b) => a + b.s, 0) / 1024).toFixed(0)} KB (${css.length} 个)`);
console.log(`JS:       ${(js.reduce((a, b) => a + b.s, 0) / 1024).toFixed(0)} KB (${js.length} 个)`);
console.log('\n--- 最大的 8 个 JS/CSS ---');
sizes
  .filter((x) => x.f.endsWith('.js') || x.f.endsWith('.css'))
  .sort((a, b) => b.s - a.s)
  .slice(0, 8)
  .forEach((x) => console.log(`  ${(x.s / 1024).toFixed(1).padStart(7)} KB  ${relative(DIST, x.f)}`));

process.exit(problems.length > 0 ? 1 : 0);
