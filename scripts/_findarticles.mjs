import { chromium } from 'playwright';
const EXECUTABLE='/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const browser = await chromium.launch({ executablePath: EXECUTABLE, args:['--no-sandbox'] });
const page = await browser.newPage({ viewport:{width:1440,height:900} });
await page.goto('https://xhblog.top/', { waitUntil:'networkidle', timeout:45000 });
await page.waitForTimeout(2000);
const links = await page.evaluate(()=>{
  const out=[];
  document.querySelectorAll('a[href*="/blog/"], a[href*="/posts/"], a[href*="/archives/"]').forEach(a=>{
    const h=a.getAttribute('href');
    if(h && !out.includes(h)) out.push(h);
  });
  return out.slice(0,15);
});
console.log(JSON.stringify(links,null,1));
await browser.close();
