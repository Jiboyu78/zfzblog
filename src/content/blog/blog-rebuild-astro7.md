---
title: '站点搭建手记：把这套博客的所有坑都写下来'
description: 'Astro 7 + Tailwind v4 + Live2D 的组合拳，踩过的坑与最终的目录结构、构建流程。'
pubDate: 2026-10-01
tags: ['Astro', 'Tailwind', '博客搭建', '静态站点']
category: '工程'
featured: true
weight: 2
---

这个站点是 2026 年 10 月重写的，从 Hexo 迁到 Astro 7。这篇记录一下**为什么这么选**和**踩了什么坑**。

## 为什么从 Hexo 迁到 Astro

Hexo + Butterfly 主题确实快，但有几个问题越来越难受：

1. **主题绑定太深**。想改一个动效，得去翻 `theme` 目录里的 EJS 模板和注入的 hexo 插件，改动很难维护。
2. **动效层全是全局注入**。Butterfly 靠 `inject` 把 JS 塞进每一页，页面多了之后加载开销明显。
3. **构建慢**。Hexo 的渲染是纯 JS 的，几百篇文章每次全量重建要一分多钟。

Astro 的取舍正好相反：内容层极其干净，动效层全部是自己的组件，想怎么改怎么改。

## 技术选型

| 需求 | 方案 | 理由 |
| --- | --- | --- |
| 静态站点 + 内容优先 | Astro 7 | 零 JS 默认输出，岛屿架构按需水合 |
| 样式 | Tailwind v4 | `@theme` 一个文件搞定设计令牌 |
| 动效 | 原生 CSS + IntersectionObserver | 不引 GSAP，够用且不占体积 |
| 看板娘 | PixiJS 8 + `@jannchie/pixi-live2d-display` | 唯一维护中的 Cubism 4 分支 |
| 搜索 | Pagefind | 构建期生成静态索引，无后端 |
| 写作 | 自研 /write + Decap CMS | 两条路都留 |

## Astro 7 的几个迁移点

从 Astro 5 升上来，这几处必改：

### 1. 配置文件位置

```
src/content/config.ts   ❌ Astro 7 完全忽略
src/content.config.ts   ✅
```

而且 `defineCollection({ type: 'content' })` 全部改成 loader：

```ts
import { defineCollection, z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().max(80),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});
```

注意 `z` 从 `astro/zod` 导入，不再是 `astro:content`。

### 2. `entry.slug` 没了

内容层的 entry 不再有保留的 `slug` 字段，一律用 `entry.id`。所有 `post.slug` 都要改成 `post.id`。

### 3. 渲染 API

```ts
// 旧
const { Content } = await post.render();
// 新
import { render } from 'astro:content';
const { Content, headings } = await render(post);
```

### 4. Tailwind 集成方式变了

`@astrojs/tailwind` 集成被移除了，改用 Vite 插件：

```js
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
});
```

然后在 CSS 里：

```css
@import 'tailwindcss';
```

### 5. sitemap 拆分了

不再输出单个 `sitemap.xml`，而是 `sitemap-index.xml` + `sitemap-0.xml`。`robots.txt` 里的引用要跟着改。

## Tailwind v4 的 `@theme`

v4 把设计令牌搬到了 CSS 里，用 `@theme` 声明：

```css
@theme {
  --color-brand-500: oklch(0.62 0.16 222);
  --font-sans: 'Inter', -apple-system, 'PingFang SC', sans-serif;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

好处是 `bg-brand-500`、`font-sans`、`ease-out-expo` 这些工具类自动生成，不用再写 `tailwind.config.js`。

色彩我全用 **OKLCH**，因为它在亮暗两套主题下切换时亮度感知一致——sRGB 的 `#1a1a1a` 和 `#f5f5f5` 视觉重量其实不对等。

## 目录结构

```
src/
├── components/          # 组件
│   ├── Background.astro     # 背景层（图片/极光/粒子/噪点）
│   ├── Header.astro
│   ├── Footer.astro
│   ├── Live2DMascot.astro   # 看板娘
│   ├── SearchDialog.astro   # ⌘K 搜索
│   ├── PostCard.astro
│   └── TagCloud.astro
├── layouts/
│   └── BaseLayout.astro     # 全局动效注入点
├── pages/
│   ├── index.astro
│   ├── blog/[...id].astro
│   ├── tags/[tag].astro
│   ├── archive.astro
│   ├── write.astro          # 写作台
│   └── search.astro
├── content/blog/       # 文章
├── content.config.ts
├── styles/global.css   # 设计令牌 + 组件样式
└── consts.ts            # 站点配置
```

## 动效的取舍

我**没有**用 GSAP 或 Framer Motion。理由：

- 博客的核心是阅读，动效只需要「提示信息层级」和「提供空间感」；
- 原生 CSS 的 `transition` + `IntersectionObserver` 足够覆盖 90% 场景；
- 少一个依赖，首屏 JS 少几十 KB。

实际用到的动效清单：

| 动效 | 实现 | 触发方式 |
| --- | --- | --- |
| 滚动揭示 | `IntersectionObserver` + `.reveal` | 进入视口 |
| 卡片 3D 倾斜 | `pointermove` + `perspective` | 桌面端悬停 |
| 阅读进度条 | `scroll` 事件 + `width` | 滚动 |
| 数字滚动 | `IntersectionObserver` + `requestAnimationFrame` | 进入视口 |
| 代码复制 | 事件委托 | 悬停显示按钮 |
| 视图过渡 | `View Transitions API` | 页面跳转 |
| 背景极光 | CSS `@keyframes` | 常驻 |
| 粒子网络 | Canvas + 鼠标斥力 | 常驻 |

全部尊重 `prefers-reduced-motion`，开启后动效自动关闭。

## 性能预算

目标：**Lighthouse 四项全 100**。

关键手段：

- 看板娘在 `requestIdleCallback` 后才加载，不抢首屏；
- 粒子数量按设备内存分档（`low`/`medium`/`high`）；
- 图片用 Astro 的 `<Image>` 自动优化；
- 字体自托管并做子集化，只保留用到的字重；
- 搜索索引构建期生成，运行时零后端请求。

最终产物：

```
dist/
├── index.html
├── blog/...
├── _astro/*.js       # ~28 KB gzip（其中看板娘 chunk 是懒加载的）
└── pagefind/         # 搜索索引
```

## 还没做的

- [ ] **深色模式图片适配**：目前封面图在暗色下有点刺眼，需要按主题准备两套；
- [ ] **评论系统**：打算用 Giscus，但要先想清楚要不要引入第三方；
- [ ] **PWA**：加 Service Worker 支持离线阅读；
- [ ] **i18n**：中文站先不做，但结构上留了口子。

## 一点总结

博客搭建这件事，**内容占 10%，工程占 90%**。真正花时间的从来不是「把页面做出来」，而是：

1. 让 300 篇文章的首屏都不超过 50KB；
2. 让看板娘在 2015 年的笔记本上不拖垮页面；
3. 让写文章这件事的摩擦降到「新建一个 md 文件」那么低。

第 3 条最重要。一个博客的成败，取决于**你多久能写完一篇**，而不是首页多好看。
