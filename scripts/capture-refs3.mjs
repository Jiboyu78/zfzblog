// 抓取候选参考站：截图 + computed style + 结构特征
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = './ref-shots';
mkdirSync(OUT, { recursive: true });

const EXECUTABLE =
  '/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';

const targets = [
  { name: 'xh', url: 'https://xhblog.top/blog/friends/' },
  { name: 'nyac', url: 'https://nyac.at/' },
  { name: 'cloudwings', url: 'https://blog.cloudwings.xyz/' },
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
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${OUT}/ref-${t.name}-fold.png` });
    await page.screenshot({ path: `${OUT}/ref-${t.name}-full.png`, fullPage: true });

    const info = await page.evaluate(() => {
      const g = (el, p) => (el ? getComputedStyle(el)[p] : null);
      const pick = (sel) => document.querySelector(sel);

      // 找最大的标题元素
      const headings = [...document.querySelectorAll('h1,h2,h3')]
        .map((h) => ({ tag: h.tagName, text: h.textContent.trim().slice(0, 30), size: parseFloat(getComputedStyle(h).fontSize), weight: getComputedStyle(h).fontWeight }))
        .filter((h) => h.text)
        .sort((a, b) => b.size - a.size)
        .slice(0, 6);

      // 主内容容器
      const mains = [...document.querySelectorAll('main, article, .post, .entry, #main, .content, .container')]
        .map((el) => ({ cls: el.className?.toString().slice(0, 40), w: Math.round(el.getBoundingClientRect().width) }))
        .filter((x) => x.w > 300 && x.w < 1200)
        .slice(0, 5);

      const body = document.body;
      const links = [...document.querySelectorAll('a')].length;
      const imgs = [...document.querySelectorAll('img')].length;
      const svgs = [...document.querySelectorAll('svg')].length;

      return {
        title: document.title,
        lang: document.documentElement.lang,
        bodyFont: g(body, 'fontFamily'),
        bodySize: g(body, 'fontSize'),
        bodyColor: g(body, 'color'),
        bodyBg: g(body, 'backgroundColor'),
        headings,
        mains,
        counts: { links, imgs, svgs, articles: document.querySelectorAll('article').length, nav: document.querySelectorAll('nav').length },
        bgImages: [...document.querySelectorAll('body *')].slice(0, 400)
          .map((el) => getComputedStyle(el).backgroundImage)
          .filter((b) => b && b !== 'none' && b.includes('url('))
          .slice(0, 5),
        fonts: [...new Set([...document.querySelectorAll('*')].slice(0, 300).map((el) => getComputedStyle(el).fontFamily))].slice(0, 5),
        fontFaces: [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } })
          .filter((r) => r.type === 5)
          .map((r) => r.style.getPropertyValue('font-family').trim())
          .filter(Boolean).slice(0, 6),
        scrollbarW: window.innerWidth - document.documentElement.clientWidth,
      };
    });

    console.log(`\n========== ${t.name} : ${t.url} ==========`);
    console.log(JSON.stringify(info, null, 2));

    // 页面结构（区块标题）
    const sections = await page.evaluate(() => {
      const sels = ['h1', 'h2', 'h3', 'aside h2', 'aside h3', '.sidebar h3', 'nav a'];
      const out = [];
      for (const s of sels) {
        document.querySelectorAll(s).forEach((e) => {
          const t = e.textContent.trim().slice(0, 28);
          if (t) out.push(`${s}: ${t}`);
        });
      }
      return [...new Set(out)].slice(0, 30);
    });
    console.log('结构：', sections.join(' | '));
  } catch (e) {
    console.log(`✗ ${t.name}: ${e.message}`);
  }
  await ctx.close();
}

await browser.close();
