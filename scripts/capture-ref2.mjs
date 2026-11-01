// 抓取参考站局部高清细节，用于像素级比对
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

const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto('https://www.cnblogs.com/SilverGo', { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2500);

// 首屏
await page.screenshot({ path: `${OUT}/ref-fold.png` });

// 滚到文章列表区
await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/ref-list.png` });

// 提取关键元素的精确样式
const detail = await page.evaluate(() => {
  const out = {};
  const g = (el, p) => (el ? getComputedStyle(el)[p] : null);

  // 找第一篇文章标题
  const postTitle = document.querySelector('#blog_post_list .postTitle, .postTitle, #blog_post_list h2');
  const title = postTitle ? getComputedStyle(postTitle) : null;

  // 文章条目
  const post = document.querySelector('#blog_post_list .blogPost, #blog_post_list .post, #blog_post_list .postBody');
  const postBox = post?.getBoundingClientRect();

  // 分类链接
  const catLink = document.querySelector('#blog_post_list .postCategory, #blog_post_list a[href*="/archive/"]');

  // 摘要
  const desc = document.querySelector('#blog_post_list .postText, #blog_post_list .postBody p');

  // published
  const pub = document.querySelector('#blog_post_list .published, #blog_post_list .postDesc');

  out.title = title && {
    font: title.fontFamily,
    size: title.fontSize,
    weight: title.fontWeight,
    color: title.color,
    lineHeight: title.lineHeight,
    margin: title.margin,
  };
  out.postBox = postBox && { width: postBox.width, left: postBox.left };
  out.catLink = catLink && {
    fontSize: getComputedStyle(catLink).fontSize,
    color: getComputedStyle(catLink).color,
    text: catLink.textContent.trim(),
  };
  out.desc = desc && {
    fontSize: getComputedStyle(desc).fontSize,
    color: getComputedStyle(desc).color,
    lineHeight: getComputedStyle(desc).lineHeight,
  };
  out.pub = pub && { fontSize: getComputedStyle(pub).fontSize, color: getComputedStyle(pub).color };

  // 侧栏
  const side = document.querySelector('#sidebar');
  out.side = side && {
    width: side.getBoundingClientRect().width,
    left: side.getBoundingClientRect().left,
  };

  // 主栏容器
  const col = document.querySelector('#blogColumn, #main');
  out.col = col && {
    width: col.getBoundingClientRect().width,
    left: col.getBoundingClientRect().left,
    padding: getComputedStyle(col).padding,
  };

  // 顶部导航
  const nav = document.querySelector('#blog_nav, #header');
  out.nav = nav && {
    height: nav.getBoundingClientRect().height,
    bg: getComputedStyle(nav).backgroundColor,
    borderBottom: getComputedStyle(nav).borderBottom,
  };

  // banner
  const banner = document.querySelector('#banner, .banner, .blogHeader, #blogHeader');
  out.banner = banner && {
    height: banner.getBoundingClientRect().height,
    bg: getComputedStyle(banner).backgroundImage.slice(0, 100),
  };

  // 全局背景
  out.bodyBg = g(document.body, 'backgroundColor');
  out.htmlBg = g(document.documentElement, 'backgroundColor');

  return out;
});

console.log(JSON.stringify(detail, null, 2));

await browser.close();
