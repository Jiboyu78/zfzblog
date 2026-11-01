// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import { remarkShoka, shokaHandler } from './src/lib/markdown/remark-shoka.ts';
import { remarkEncrypted } from './src/lib/markdown/remark-encrypted.ts';
import { rehypeEncrypted } from './src/lib/markdown/rehype-encrypted.ts';
import { remarkRuby } from './src/lib/markdown/remark-ruby.ts';
import { remarkSpoiler } from './src/lib/markdown/remark-spoiler.ts';
import { remarkInlineEffects } from './src/lib/markdown/remark-inline-effects.ts';
import { remarkQuiz } from './src/lib/markdown/remark-quiz.ts';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Live2D 资源探测（构建期）
 *
 * Cubism Core 是 Live2D Inc. 的专有软件，禁止再分发，
 * 所以绝大多数站点都没有它。如果不提前探测：
 *   1. 每个页面都会刷一条 404 请求
 *   2. Pixi.js + Cubism4 渲染器（约 760KB）会被打进产物却永远用不上
 * 探测后把结果编译成常量，Rollup 就能整块 tree-shake 掉这些依赖。
 */
const PUB = fileURLToPath(new URL('./public/', import.meta.url));
const hasCubismCore = existsSync(`${PUB}models/live2dcubismcore.min.js`);
const hasModel = existsSync(`${PUB}models/dafeiyu/大肥鱼.model3.json`);
const LIVE2D_ENABLED = hasCubismCore && hasModel;

if (!LIVE2D_ENABLED) {
  console.log(
    '\x1b[33m[live2d] 未检测到 Cubism Core 或模型文件 —— ' +
      '看板娘将使用静态立绘，Pixi.js 不会被打包。' +
      '放置说明见 scripts/setup-live2d.sh\x1b[0m'
  );
}

// https://astro.build/config
export default defineConfig({
  // canonical / OG / sitemap / RSS 全部以它为准，必须和 src/config/site.ts 的 site.url 一致。
  // 换绑自定义域名时，只改这两个地方（以及 public/robots.txt 的 Sitemap 行）。
  site: 'https://zfzblog.pages.dev',
  // 中文站优先编码 UTF-8，构建时压缩 HTML
  compressHTML: true,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/write'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      // 编译期常量：false 时 Pixi 相关代码会被完全 tree-shake
      __LIVE2D_ENABLED__: JSON.stringify(LIVE2D_ENABLED),
    },
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  markdown: {
    // Astro 7 默认使用 Sütterlin 处理器；要启用 remark/rehype 插件
    // （如 KaTeX 公式渲染），必须显式切回 unified。
    // Astro 7：所有 remark/rehype 插件与 remarkRehype 都必须传进 unified({...})
    // 处理器：unified({ remarkPlugins, rehypePlugins, remarkRehype })
    // 顺序至关重要（见 docs/模板开发说明.md R4.2）：
    // directive 最先（容器语法依赖）→ math 在 ruby/effects 之前（保护 $x^2$）→ 加密块最后
    processor: unified({
      remarkPlugins: [
        remarkDirective,      // 1. directive 必须最先（容器语法依赖它）
        remarkMath,           // 2. 数学必须在 ruby/effects 之前
        remarkRuby,           // 3. {文字^注音}
        remarkSpoiler,        // 4. !!隐藏!!
        remarkInlineEffects,  // 5. ++下划线++ ==高亮== ~下标~ ^上标^
        remarkQuiz,           // 6. ```quiz 答题块
        remarkShoka,          // 7. :::tip 等容器（标记 + 紧凑展开）
        remarkEncrypted,      // 8. :::encrypted（标记）
      ],
      rehypePlugins: [
        rehypeKatex,
        rehypeEncrypted,      // 加密块必须最后（加密的是已渲染完毕的 HTML）
      ],
      remarkRehype: {
        // Shoka 容器依赖 remark-directive 的 containerDirective 节点，
        // 需要自定义 handler 转成 hast（正文递归渲染）。
        handlers: { containerDirective: shokaHandler },
      },
    }),
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: true,
    },
  },
});
