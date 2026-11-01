// 抓取本站截图，用于视觉验收
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = './shots-v2';
mkdirSync(OUT, { recursive: true });

const EXECUTABLE =
  '/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const BASE = 'http://127.0.0.1:4323';

const targets = [
  { name: 'home', url: `${BASE}/`, full: true },
  { name: 'post', url: `${BASE}/blog/p5685-jsoi2013-jyy/`, full: false },
  { name: 'blog-list', url: `${BASE}/blog/`, full: false },
  { name: 'archive', url: `${BASE}/archive/`, full: false },
  { name: 'tags', url: `${BASE}/tags/`, full: false },
  { name: 'about', url: `${BASE}/about/`, full: false },
  { name: 'write', url: `${BASE}/write/`, full: false },
  { name: 'friends', url: `${BASE}/friends/`, full: false },
  { name: '404', url: `${BASE}/not-exist/`, full: false },
];

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let errors = [];

for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') pageErrors.push(m.text());
  });
  page.on('pageerror', (e) => pageErrors.push(`PAGEERROR: ${e.message}`));

  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/${t.name}.png`, fullPage: t.full });
    console.log(`✓ ${t.name}`);
  } catch (e) {
    console.log(`✗ ${t.name}: ${e.message}`);
  }

  if (pageErrors.length) {
    errors.push([t.name, pageErrors]);
    console.log(`  ⚠ ${pageErrors.length} 个控制台错误`);
  }
  await ctx.close();
}

// 暗色模式首页
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/home-dark.png`, fullPage: false });
  console.log('✓ home-dark');
  await ctx.close();
}

// 移动端首页
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/home-mobile.png`, fullPage: false });
  console.log('✓ home-mobile');
  await ctx.close();
}

console.log('\n===== 控制台错误汇总 =====');
if (!errors.length) console.log('无');
for (const [name, errs] of errors) {
  console.log(`\n[${name}]`);
  errs.slice(0, 8).forEach((e) => console.log('  ' + e.slice(0, 220)));
}

await browser.close();
