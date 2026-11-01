// 深挖三个参考站：文章页布局 / 交互 / 特色组件
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

const sites = [
  { name: 'xh', base: 'https://xhblog.top', paths: ['/', '/blog/friends/'] },
  { name: 'nyac', base: 'https://nyac.at', paths: ['/', '/blog/'] },
  { name: 'cloudwings', base: 'https://blog.cloudwings.xyz', paths: ['/', '/archives/'] },
];

for (const s of sites) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  for (const path of s.paths) {
    try {
      await page.goto(s.base + path, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2500);
      const fname = `${OUT}/deep-${s.name}${path.replace(/\//g, '_') || '_home'}.png`;
      await page.screenshot({ path: fname });

      const detail = await page.evaluate(() => {
        const g = (el, p) => (el ? getComputedStyle(el)[p] : null);
        const rect = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x) };
        };

        // 找正文容器（通常是宽度 600-800 的块）
        const candidates = [...document.querySelectorAll('div,article,section')]
          .map((el) => ({
            cls: (el.className?.toString() || el.tagName).slice(0, 50),
            w: Math.round(el.getBoundingClientRect().width),
            fs: parseFloat(getComputedStyle(el).fontSize),
            lh: getComputedStyle(el).lineHeight,
            ti: getComputedStyle(el).textIndent,
          }))
          .filter((c) => c.w > 500 && c.w < 900 && c.fs >= 14)
          .slice(0, 6);

        // 交互元素统计
        const interactive = {
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          canvas: document.querySelectorAll('canvas').length,
          details: document.querySelectorAll('details').length,
          iframes: document.querySelectorAll('iframe').length,
        };

        // 固定/吸顶元素
        const fixed = [...document.querySelectorAll('*')]
          .filter((el) => {
            const p = getComputedStyle(el).position;
            return p === 'fixed' || p === 'sticky';
          })
          .map((el) => `${(el.className?.toString() || el.tagName).slice(0, 30)}:${getComputedStyle(el).position}`)
          .slice(0, 8);

        return {
          url: location.pathname,
          title: document.title,
          viewport: { w: innerWidth, h: innerHeight },
          bodyBg: g(document.body, 'backgroundColor'),
          bodySize: g(document.body, 'fontSize'),
          proseCandidates: candidates,
          fixed,
          interactive,
          // 阴影/圆角统计 —— 判断是"卡片风"还是"极简风"
          shadows: [...document.querySelectorAll('*')].slice(0, 200)
            .map((el) => getComputedStyle(el).boxShadow)
            .filter((s) => s && s !== 'none').length,
          radiusBig: [...document.querySelectorAll('*')].slice(0, 200)
            .filter((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) > 10).length,
          gradients: [...document.querySelectorAll('*')].slice(0, 200)
            .map((el) => getComputedStyle(el).backgroundImage)
            .filter((b) => b && b.includes('gradient')).length,
          hasTransition: !!document.querySelector('[class*="transition"], .swup, [data-transition]'),
          scrollBehavior: g(document.documentElement, 'scrollBehavior'),
        };
      });

      console.log(`\n===== ${s.name}${path} =====`);
      console.log(JSON.stringify(detail, null, 1));
    } catch (e) {
      console.log(`✗ ${s.name}${path}: ${e.message}`);
    }
  }
  await ctx.close();
}

await browser.close();
