// 截图脚本：验证各页面在明暗两种主题下的渲染效果
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4321';
const OUT = process.env.OUT_DIR || './shots';
mkdirSync(OUT, { recursive: true });

// 复用本机已缓存的 chromium，避免重复下载
const EXECUTABLE =
  process.env.CHROMIUM_PATH ||
  '/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const PAGES = [
  { name: '01-home', path: '/', full: true },
  { name: '02-blog-list', path: '/blog/', full: true },
  { name: '03-post', path: '/blog/p5685-jsoi2013-jyy/', full: true },
  { name: '04-write', path: '/write/', full: true },
  { name: '05-archive', path: '/archive/', full: true },
  { name: '06-about', path: '/about/', full: true },
  { name: '07-friends', path: '/friends/', full: true },
  { name: '08-tags', path: '/tags/', full: false },
  { name: '09-404', path: '/404', full: false },
];

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const errors = [];

for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: theme,
  });
  const page = await ctx.newPage();

  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${theme}] console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[${theme}] pageerror: ${e.message}`));

  for (const p of PAGES) {
    try {
      await page.goto(BASE + p.path, { waitUntil: 'networkidle', timeout: 30000 });
      // 触发所有滚动揭示
      await page.evaluate(async () => {
        await new Promise((r) => setTimeout(r, 300));
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((r) => setTimeout(r, 600));
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
      });
      await page.waitForTimeout(700);
      const suffix = theme === 'dark' ? '-dark' : '';
      await page.screenshot({
        path: `${OUT}/${p.name}${suffix}.png`,
        fullPage: p.full,
      });
      console.log(`✓ ${p.name}${suffix}`);
    } catch (e) {
      errors.push(`[${theme}] ${p.path}: ${e.message}`);
      console.log(`✗ ${p.path} ${e.message}`);
    }
  }
  await ctx.close();
}

// 移动端
const mctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
const mp = await mctx.newPage();
for (const p of [{ n: '01-home', u: '/' }, { n: '03-post', u: '/blog/p5685-jsoi2013-jyy/' }]) {
  await mp.goto(BASE + p.u, { waitUntil: 'networkidle', timeout: 30000 });
  await mp.waitForTimeout(700);
  await mp.screenshot({ path: `${OUT}/${p.n}-mobile.png`, fullPage: false });
  console.log(`✓ ${p.n}-mobile`);
}
await mctx.close();

await browser.close();

console.log('\n===== 错误汇总 =====');
if (errors.length === 0) console.log('无 JS 错误');
else errors.forEach((e) => console.log(e));
