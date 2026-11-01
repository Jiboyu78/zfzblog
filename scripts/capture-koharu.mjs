// 抓取 astro-koharu demo 站（blog.cosine.ren）+ snow demo 补充：截图 + 设计参数
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = './ref-shots';
mkdirSync(OUT, { recursive: true });

const EXECUTABLE =
  '/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const targets = [
  { name: 'koharu-home', url: 'https://koharu.cosine.ren/' },
  { name: 'koharu-post', url: 'https://koharu.cosine.ren/post/hello-world' },
  { name: 'koharu-editor', url: 'https://koharu.cosine.ren/editor/' },
  { name: 'snow-home', url: 'https://xhblog.top/' },
];

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  try {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);

    await page.screenshot({ path: `${OUT}/${t.name}-fold.png` });
    await page.screenshot({ path: `${OUT}/${t.name}-full.png`, fullPage: true });

    const info = await page.evaluate(() => {
      const pick = (sel) => document.querySelector(sel);
      const cs = (el) => (el ? getComputedStyle(el) : null);
      const g = (el, p) => (el ? getComputedStyle(el)[p] : null);

      const root = cs(document.documentElement);
      const body = cs(document.body);
      const h1 = pick('h1');
      const p = pick('p');
      const main = pick('main') || pick('article') || pick('#main-content');

      // 收集所有圆角值
      const radii = new Set();
      const shadows = new Set();
      const gradients = new Set();
      const fonts = new Set();
      let fixedCount = 0;
      let stickyCount = 0;
      const sample = [...document.querySelectorAll('div,section,article,header,footer,nav,li,a')].slice(0, 900);
      for (const el of sample) {
        const s = cs(el);
        if (!s) continue;
        if (s.borderRadius && s.borderRadius !== '0px') radii.add(s.borderRadius);
        if (s.boxShadow && s.boxShadow !== 'none') shadows.add(s.boxShadow.slice(0, 70));
        if (s.backgroundImage && s.backgroundImage.includes('gradient')) gradients.add(s.backgroundImage.slice(0, 90));
        if (s.fontFamily) fonts.add(s.fontFamily.split(',')[0].replace(/["']/g, ''));
        if (s.position === 'fixed') fixedCount++;
        if (s.position === 'sticky') stickyCount++;
      }

      // 导航项
      const navLinks = [...document.querySelectorAll('header nav a, nav a')]
        .slice(0, 20)
        .map((a) => a.textContent.trim())
        .filter(Boolean);

      return {
        title: document.title,
        htmlFontSize: root.fontSize,
        bodyFontSize: body.fontSize,
        bodyFontFamily: body.fontFamily,
        bodyColor: body.color,
        bodyBg: body.backgroundColor,
        bodyBgImage: body.backgroundImage.slice(0, 160),
        h1: h1 ? { text: h1.textContent.trim().slice(0, 40), size: g(h1, 'fontSize'), weight: g(h1, 'fontWeight'), color: g(h1, 'color') } : null,
        p: p ? { size: g(p, 'fontSize'), lh: g(p, 'lineHeight'), indent: g(p, 'textIndent'), ff: g(p, 'fontFamily').split(',')[0] } : null,
        main: main ? { bg: g(main, 'backgroundColor'), radius: g(main, 'borderRadius'), maxW: g(main, 'maxWidth'), pad: g(main, 'padding') } : null,
        radii: [...radii].slice(0, 14),
        shadows: [...shadows].slice(0, 8),
        gradients: [...gradients].slice(0, 6),
        fonts: [...fonts].slice(0, 12),
        fixedCount,
        stickyCount,
        navLinks,
        linkCount: document.querySelectorAll('a').length,
        imgCount: document.querySelectorAll('img').length,
        svgCount: document.querySelectorAll('svg').length,
      };
    });
    console.log(`\n===== ${t.name} ${t.url} =====`);
    console.log(JSON.stringify(info, null, 1));
  } catch (e) {
    console.log(`\n===== ${t.name} FAILED: ${e.message} =====`);
  }
  await ctx.close();
}

await browser.close();
console.log('\nDONE');
