# Yuki 的算法手账 · 个人博客

> 一个「OIer风格」的个人站点：Astro 7 + Tailwind CSS v4 + Live2D 看板娘，
> 大量手写动效、零 JS 默认输出、上传文章一步到位。
> 部署到 Cloudflare Pages。

## 技术栈

- **渲染层** Astro 7（SSG 全静态、岛屿按需水合、零 JS 默认）
- **样式层** Tailwind CSS v4（`@theme` 设计令牌、三套预设 sakura/snow/mono 一键换肤）
- **交互层** 原生 JS（IntersectionObserver / Canvas / WebGL），不引入 GSAP
- **看板娘** PixiJS 8 + @jannchie/pixi-live2d-display（Cubism 4，懒加载 + 降级链）
- **内容层** Markdown / MDX（Content Collections + Zod schema），KaTeX / Shiki
- **搜索** Pagefind（构建期静态索引）
- **评论** Giscus（vanilla iframe 懒加载）

## 功能（R4–R7 全部落地）

- **Markdown 增强全家桶**：Shoka 容器（:::tip/warning/danger/note/details）、注音 {汉字^注音}、剧透 !!隐藏!!、行内效果（++下划线++/==高亮==/~下标~/^上标^）、交互答题块（```quiz）、加密块（:::encrypted）、代码块工具栏（复制/全屏）
- **动效三档**（灵动/克制/减弱，localStorage 记忆，尊重 prefers-reduced-motion）+ 樱花粒子层 + 滚动进度条
- **写作室** 本地编辑器（marked 实时预览、frontmatter 表单、拖拽导入、localStorage 草稿、导出 .md）
- **AI 摘要**（TF-IDF 抽取式，md5 增量缓存）+ **语义相关推荐**（余弦相似度）
- **静态 Moments 时间线**（本地 JSON，纯静态零运维）
- **明暗双主题**、Live2D 看板娘（大肥鱼免费公皮）

## 开发

```bash
npm install --include=dev   # 注意 NODE_ENV 可能是 production，需显式装 devDeps
npm run editor              # 打包写作室编辑器（public/editor/editor.js）
npm run generate            # 生成 AI 摘要 + 相关推荐缓存
npm run dev                 # 开发
npm run build               # 构建（astro build + og + pagefind，搜索依赖完整跑）
npm run check               # astro check 类型检查
npm run check:links         # 死链检查
npm run shots               # 多页面多主题截图验证
```

> 所有命令建议加 `PATH=/usr/local/bin:$PATH`（系统 node 24 才满足 Astro 7 的 node 要求）。

## 图床（免信用卡）

本站图片统一用 `/img/placeholder.svg` 占位，部署前替换为图床 URL。推荐免信用卡方案：
- **ImgBB**（首选，有免费 API + 管理后台，适合博客长期配图）`https://imgbb.com/`
- **Catbox**（备选，免注册、单文件 200MB、不压缩）`https://catbox.moe/`

## 部署到 Cloudflare Pages

1. 在 Cloudflare 创建 Pages 项目 `zfzblog`，连接 GitHub 仓库 `Jiboyu78/zfzblog`，选分支 `main`；
2. 构建命令 `npm run build`，输出目录 `dist`（`public/_headers` 已配好缓存与安全头）；
3. 或推 main 后由 `.github/workflows/deploy.yml` 自动部署（需配置 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` 两个 secret）。

## Live2D 模型（授权说明）

大肥鱼（DeepSeek-chan）为免费公皮：
- 原画/拆分：神宫凉子 · Live2D 建模：霓虹猫_NeonNeko
- 允许个人直播/视频创作及收益；**禁止二次销售、禁止擅自重新分发模型文件**。

因 Cubism Core 是 Live2D Inc. 专有软件（禁止再分发）且模型文件不允许随仓库分发，故 `public/models/` 被 `.gitignore` 排除。本地开发已放置模型即可启用；CI 部署时站点自动降级为静态立绘（不报错、不阻塞）。

## 目录速查

- 站点配置：`src/config/site.ts`（站名/导航/功能开关/图床/评论/Live2D）
- 主题预设：`src/config/theme.ts`（sakura/snow/mono 三套，改 `site.preset` 换肤）
- 文章：`src/content/blog/*.md`
- 构建脚本：`scripts/`（gen-og、check-links、shoot-v3、generate-*）
