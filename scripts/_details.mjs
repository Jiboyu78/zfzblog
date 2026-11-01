import { chromium } from 'playwright';
const EXECUTABLE='/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const browser = await chromium.launch({ executablePath: EXECUTABLE, args:['--no-sandbox'] });

// 1) nyac 是否有 Live2D / canvas
{
  const page = await browser.newPage({ viewport:{width:1440,height:900} });
  await page.goto('https://nyac.at/', { waitUntil:'networkidle', timeout:45000 });
  await page.waitForTimeout(3000);
  const d = await page.evaluate(()=>({
    canvas: document.querySelectorAll('canvas').length,
    live2d: document.querySelectorAll('[class*="live2d"],[id*="live2d"],[class*="model"],[id*="model"]').length,
    scripts: [...document.querySelectorAll('script[src]')].map(s=>s.src).filter(s=>/live2d|pixi|model/i.test(s)),
    fixedEls: [...document.querySelectorAll('*')].filter(e=>['fixed','sticky'].includes(getComputedStyle(e).position)).map(e=>`${(e.className?.toString()||e.tagName).slice(0,40)}:${getComputedStyle(e).position}`).slice(0,6),
    imgs: [...document.querySelectorAll('img')].map(i=>i.src.slice(0,90)).slice(0,5),
  }));
  console.log('=== nyac ==='); console.log(JSON.stringify(d,null,1));
  await page.close();
}

// 2) cloudwings 文章页的 TOC / 阅读量 / 上下篇
{
  const page = await browser.newPage({ viewport:{width:1440,height:900} });
  await page.goto('https://blog.cloudwings.xyz/posts/mit-missing-semester/', { waitUntil:'networkidle', timeout:45000 });
  await page.waitForTimeout(2500);
  const d = await page.evaluate(()=>({
    tocWidthVar: getComputedStyle(document.documentElement).getPropertyValue('--toc-width'),
    bodyFont: getComputedStyle(document.body).fontFamily,
    bodySize: getComputedStyle(document.body).fontSize,
    prose: (()=>{
      const el=[...document.querySelectorAll('div')].find(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>600&&r.width<900&&parseFloat(s.fontSize)>=15;});
      if(!el) return null;
      const s=getComputedStyle(el);
      return {cls:(el.className||'').toString().slice(0,50), fs:s.fontSize, lh:s.lineHeight, ti:s.textIndent, color:s.color, justify:s.textAlign};
    })(),
    // 头部统计项
    stats: [...document.querySelectorAll('span,div')].map(e=>e.textContent.trim()).filter(t=>/字|分钟|阅读|read|评论/.test(t)&&t.length<24).slice(0,8),
    // 上一篇/下一篇
    prevNext: [...document.querySelectorAll('a')].map(a=>a.textContent.trim()).filter(t=>t&&t.length<20).slice(0,6),
  }));
  console.log('=== cloudwings article ==='); console.log(JSON.stringify(d,null,1));
  await page.close();
}
await browser.close();
