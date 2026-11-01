// 抓取本地站点关键页面：首屏 / 暗色 / 移动端
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = './shots';
mkdirSync(OUT, { recursive: true });

const EXECUTABLE =
  '/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const BASE = 'http://localhost:4323';

const targets = [
  { name: 'home', url: `${BASE}/`, dark: false, mobile: false },
  { name: 'home-dark', url: `${BASE}/`, dark: true, mobile: false },
  { name: 'home-mobile', url: `${BASE}/`, dark: false, mobile: true },
  { name: 'blog', url: `${BASE}/blog/`, dark: false, mobile: false },
  { name: 'post', url: `${BASE}/blog/r4-syntax-demo/`, dark: false, mobile: false },
  { name: 'about', url: `${BASE}/about/`, dark: false, mobile: false },
];

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const errors = [];

for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: t.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: t.dark ? 'dark' : 'light',
    isMobile: t.mobile,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${t.name}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[${t.name}] PAGEERROR ${e.message}`));

  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${OUT}/v2-${t.name}-fold.png` });
    if (!t.mobile) {
      await page.screenshot({ path: `${OUT}/v2-${t.name}-full.png`, fullPage: true });
    }
    console.log(`OK ${t.name}`);
  } catch (e) {
    console.log(`FAIL ${t.name}: ${e.message}`);
  }
  await ctx.close();
}

await browser.close();
console.log('\n=== CONSOLE ERRORS ===');
console.log(errors.length ? errors.join('\n') : '(none)');
