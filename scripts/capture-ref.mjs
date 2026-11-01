// 抓取参考站点截图，用于分析视觉设计
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = './ref-shots';
mkdirSync(OUT, { recursive: true });

const EXECUTABLE =
  '/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const targets = [
  { name: 'ref-home', url: 'https://www.cnblogs.com/SilverGo', full: true },
  { name: 'ref-post', url: 'https://www.cnblogs.com/SilverGo/p/23349054', full: false },
];

for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/${t.name}.png`, fullPage: t.full });
    console.log(`✓ ${t.name}`);

    // 提取关键样式信息
    const info = await page.evaluate(() => {
      const g = (el, prop) => (el ? getComputedStyle(el)[prop] : null);
      const body = document.body;
      const header = document.querySelector('#header, .blogHeader, header');
      const banner = document.querySelector('#banner, .banner, .blog-banner');
      const title = document.querySelector('#Header1_HeaderTitle, .blogTitle, h1.title');
      const side = document.querySelector('#sidebar, .sidebar');
      const main = document.querySelector('#blogColumn, #main, .post');
      const fontLinks = [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href);
      return {
        bodyBg: g(body, 'backgroundColor'),
        bodyFont: g(body, 'fontFamily'),
        bodyFontSize: g(body, 'fontSize'),
        bodyColor: g(body, 'color'),
        headerBg: g(header, 'backgroundColor'),
        headerH: header?.getBoundingClientRect().height,
        bannerBg: g(banner, 'backgroundImage')?.slice(0, 120),
        bannerH: banner?.getBoundingClientRect().height,
        titleFont: g(title, 'fontFamily'),
        titleSize: g(title, 'fontSize'),
        titleColor: g(title, 'color'),
        sideWidth: side?.getBoundingClientRect().width,
        mainWidth: main?.getBoundingClientRect().width,
        sidePos: g(side, 'position'),
        stylesheets: fontLinks.slice(0, 8),
      };
    });
    console.log(JSON.stringify(info, null, 2));

    // 侧栏小部件清单
    const widgets = await page.evaluate(() => {
      const w = document.querySelector('#sidebar');
      return w ? [...w.querySelectorAll('h3, .widget-title')].map((e) => e.textContent.trim()).filter(Boolean) : [];
    });
    console.log('侧栏组件:', widgets.join(' | '));
  } catch (e) {
    console.log(`✗ ${t.name}: ${e.message}`);
  }
  await ctx.close();
}

await browser.close();
