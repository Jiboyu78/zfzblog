import { chromium } from 'playwright';
const EXECUTABLE='/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const OUT='./ref-shots';
const browser = await chromium.launch({ executablePath: EXECUTABLE, args:['--no-sandbox'] });
const targets = [
  ['xh-article', 'https://xhblog.top/blog/'],
  ['xh-bloglist', 'https://xhblog.top/blog'],
  ['nyac-post', 'https://nyac.at/posts'],
  ['cw-article', 'https://blog.cloudwings.xyz/posts/mit-missing-semester/'],
  ['cw-archive', 'https://blog.cloudwings.xyz/archive/'],
];
for (const [n,u] of targets){
  const ctx = await browser.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:2 });
  const page = await ctx.newPage();
  try{
    await page.goto(u, { waitUntil:'networkidle', timeout:45000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path:`${OUT}/art-${n}.png` });
    await page.screenshot({ path:`${OUT}/art-${n}-full.png`, fullPage:true });
    console.log(`✓ ${n}`);
  }catch(e){ console.log(`✗ ${n}: ${e.message}`); }
  await ctx.close();
}
await browser.close();
