import { chromium } from 'playwright';
const EXECUTABLE='/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const browser = await chromium.launch({ executablePath: EXECUTABLE, args:['--no-sandbox'] });
const targets = [
  ['xh', 'https://xhblog.top/'],
  ['nyac', 'https://nyac.at/'],
  ['cw', 'https://blog.cloudwings.xyz/'],
];
for (const [n,u] of targets){
  const page = await browser.newPage({ viewport:{width:1440,height:900} });
  await page.goto(u, { waitUntil:'networkidle', timeout:45000 });
  await page.waitForTimeout(2500);
  const links = await page.evaluate(()=>[...new Set([...document.querySelectorAll('a')].map(a=>a.getAttribute('href')).filter(h=>h&&h.startsWith('/')&&h.split('/').filter(Boolean).length>=1&&!h.includes('.css')&&!h.includes('.js')&&!h.includes('#')))].slice(0,25));
  console.log(`\n=== ${n} ===`);
  console.log(links.join('\n'));
  await page.close();
}
await browser.close();
