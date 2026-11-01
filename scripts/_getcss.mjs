import { chromium } from 'playwright';
const EXECUTABLE='/Users/admin78/Library/Caches/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const browser = await chromium.launch({ executablePath: EXECUTABLE, args:['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('https://www.cnblogs.com/SilverGo', { waitUntil:'networkidle', timeout:45000 });
const links = await page.evaluate(()=>[...document.querySelectorAll('link[rel=stylesheet]')].map(l=>l.href));
console.log(links.join('\n'));
await browser.close();
