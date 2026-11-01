// 搜索功能端到端测试：用真实浏览器验证 Pagefind 索引与 ⌘K 对话框
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4321';
const EXECUTABLE =
  process.env.CHROMIUM_PATH ||
  '/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });

// 1. ⌘K 唤起对话框
await page.keyboard.press('Meta+k');
await page.waitForTimeout(600);
const dialogOpen = await page.evaluate(() => {
  const d = document.getElementById('search-dialog');
  return d?.open === true;
});
console.log(dialogOpen ? '✓ ⌘K 打开搜索对话框' : '✗ ⌘K 未打开对话框');

// 2. 输入关键词，等待结果
const QUERIES = ['分块', 'Live2D', '谐音梗', '区间DP', '看板娘'];
for (const q of QUERIES) {
  await page.fill('#search-input', q);
  await page.waitForTimeout(1400);
  const count = await page.evaluate(() =>
    document.querySelectorAll('#search-results .sr-item').length
  );
  const firstTitle = await page.evaluate(() => {
    const el = document.querySelector('#search-results .sr-item .sr-title');
    return el?.textContent?.trim().slice(0, 40) || '(无结果)';
  });
  console.log(`  搜索「${q}」→ ${count} 条 | 首条：${firstTitle}`);
}

// 3. 独立搜索页
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.goto(BASE + '/search/', { waitUntil: 'networkidle' });
await page.fill('#sp-input', '分块');
await page.waitForTimeout(1400);
const pageCount = await page.evaluate(() =>
  document.querySelectorAll('#sp-results .sp-item').length
);
console.log(`  独立搜索页「分块」→ ${pageCount} 条`);

// 4. 主题切换
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
const beforeDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
await page.click('#theme-toggle');
await page.waitForTimeout(400);
const afterDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
console.log(`✓ 主题切换：${beforeDark ? 'dark' : 'light'} → ${afterDark ? 'dark' : 'light'}`);

// 5. 写作台交互
await page.goto(BASE + '/write/', { waitUntil: 'networkidle' });
await page.fill('#f-title', '测试文章标题');
await page.fill('#f-body', '## 小标题\n\n这是**粗体**正文。\n\n- 项目一\n- 项目二');
await page.waitForTimeout(700);
const previewH2 = await page.evaluate(() => document.querySelector('#preview-area h2')?.textContent);
const previewStrong = await page.evaluate(() => document.querySelector('#preview-area strong')?.textContent);
console.log(`✓ 写作台预览：h2="${previewH2}" strong="${previewStrong}"`);

// 6. 拖拽上传解析 frontmatter
await page.evaluate(() => {
  const md = `---\ntitle: "从文件导入的文章"\npubDate: 2026-01-02\ntags: [测试, 导入]\ncategory: 工程\n---\n\n正文内容`;
  const dt = new DataTransfer();
  dt.items.add(new File([md], 'test.md', { type: 'text/markdown' }));
  const zone = document.getElementById('drop-zone');
  zone.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));
});
await page.waitForTimeout(900);
const importedTitle = await page.inputValue('#f-title');
const importedTags = await page.inputValue('#f-tags');
const importedCat = await page.inputValue('#f-category');
console.log(`✓ 拖拽导入：title="${importedTitle}" tags="${importedTags}" category="${importedCat}"`);

await browser.close();

console.log('\n===== JS 错误 =====');
console.log(errors.length ? errors.join('\n') : '无');
