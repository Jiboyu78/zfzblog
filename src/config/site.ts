/**
 * 站点主配置 —— 改这一个文件就能换站
 *
 * 分组：
 *   site      站点身份（标题/域名/作者/SEO）
 *   social    社交链接
 *   nav       顶部导航
 *   features  功能开关
 *   live2d    Live2D 挂件
 *   comments  评论系统
 *   gallery   插画图库
 */

import type { PresetId } from './theme';

/* ============================================================
   站点身份
   ============================================================ */
export const site = {
  /** 站点名 */
  title: 'lnzfz’s blog',
  /** 副标题 —— 标签页副标题 / OG */
  subtitle: '一个正在自学计算机的蒟蒻',
  /** 英文名 / @ handle */
  alternate: 'lnzfz',
  /** 作者名 */
  author: 'Neoma / lnzfz',
  /** 一句话简介（引导页签名 + GitHub 简介 + SEO） */
  description: '一个正在自学计算机的蒟蒻',
  /** 个人简介（关于页） */
  bio: '嘉豪蒟蒻折腾记',
  /** 站点根 URL —— 结尾不要加斜杠 */
  url: 'https://zfzblog.pages.dev',
  /** 头像（引导页 + 关于页共用） */
  avatar: '/img/avatar.jpg',
  /** 标签页在后台时的标题 */
  hiddenTitle: '我与我周旋久，宁作我',
  /** 建站年月 */
  startDate: '2026.11',
  /** 建站年份（页脚版权用） */
  startYear: 2026,
  /** 时区 */
  timezone: 'Asia/Shanghai',
  /** SEO 关键词 */
  keywords: ['博客', '算法', 'LLM', '数学建模', '自学计算机'],
  /** 主题预设 —— 换这一行就能整体换肤 */
  preset: 'snow' as PresetId,
  /** 每页文章数 */
  postsPerPage: 8,
  /** 备案号 */
  icp: '',
} as const;

/* ============================================================
   个性标签（关于页自定义，分组展示）
   ============================================================ */
export const personas = {
  /** 标签背景图（毛玻璃卡片层下，30% 透明） */
  background: '/img/about/bg.jpg',
  /** 分组标签 */
  groups: [
    { name: '兴趣方向', tags: ['算法', 'LLM', '数学建模'] },
    { name: '喜欢的事物', tags: ['三体', '宁荣荣', '异世界情绪'] },
  ],
} as const;

/* ============================================================
   社交链接
   ============================================================ */
export const social = {
  github: { label: 'GitHub', url: 'https://github.com/Jiboyu78' },
  zhihu: { label: '知乎', url: 'https://www.zhihu.com/people/darntw' },
  bilibili: { label: 'Bilibili', url: 'https://space.bilibili.com/2127746847' },
} as const;

/** 每个社交平台的品牌色 + 内联 SVG logo（用于首页/关于页图标） */
export const socialIcons: Record<string, { color: string; svg: string }> = {
  github: {
    color: '#181717',
    svg: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
  },
  zhihu: {
    color: '#0066ff',
    svg: '<svg viewBox="0 0 1024 1024" fill="currentColor"><path d="M170.54 148.13v663.74h519.57l108.69 63.07V148.13H170.54zm735.5-36.89H118l-35.94 176.84H82v700.83h158.07v28.69l209.51-121.51H906v-807.85zM596.21 745.02H354.68V612.3h177.55v-79.19H354.68V277.17h241.53v255.92H453.32v79.19h142.89v132.74z"/></svg>',
  },
  bilibili: {
    color: '#00a1d6',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.066.142.09.213.09h4.267a.26.26 0 0 0 .213-.09l2.746-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.787 1.894v7.52c.017.76.28 1.388.787 1.885s1.134.764 1.88.787h13.334c.746-.023 1.373-.29 1.88-.787.506-.498.76-1.124.782-1.886v-7.52c-.022-.76-.276-1.39-.782-1.893-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.157.711-.42.96-.263.25-.58.374-.953.374s-.684-.125-.933-.374c-.25-.25-.374-.57-.374-.96V12.44c0-.39.125-.711.374-.96.249-.25.56-.374.973-.374zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.157.711-.42.96-.263.25-.58.374-.953.374s-.684-.125-.933-.374c-.25-.25-.374-.57-.374-.96V12.44c0-.39.125-.711.374-.96.249-.25.56-.374.973-.374z"/></svg>',
  },
} as const;

/** 访客可见的社交键（首页 + 关于页用） */
export const socialKeys = ['github', 'zhihu', 'bilibili'] as const;

export type SocialKey = keyof typeof social;

/* ============================================================
   顶部导航
   ============================================================ */
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  /** 有 children 时 href 仅作为折叠触发 */
  children?: NavItem[];
}

export const nav: NavItem[] = [
  { title: '首页', href: '/', icon: 'ri:home-heart-fill' },
  {
    title: '文章',
    href: '/blog/',
    icon: 'ri:quill-pen-ai-fill',
    children: [
      { title: '分类', href: '/archive/', icon: 'ri:grid-fill' },
      { title: '标签', href: '/tags/', icon: 'ri:price-tag-3-fill' },
      { title: '归档', href: '/archive/', icon: 'ri:archive-2-fill' },
    ],
  },
  { title: '动态', href: '/moments/', icon: 'ri:chat-smile-3-fill' },
  { title: '友链', href: '/friends/', icon: 'ri:links-line' },
  { title: '写作室', href: '/write/', icon: 'ri:edit-box-line' },
  { title: '关于', href: '/about/', icon: 'fa6-regular:circle-user' },
];

/* ============================================================
   功能开关 —— 全部可关，关闭后相关代码不打包
   ============================================================ */
export const features = {
  /** 全站搜索（Pagefind，构建后索引） */
  search: true,
  /** 文章评论 */
  comments: true,
  /** 右下角 Live2D 挂件 */
  live2d: true,
  /** 语义相似文章推荐（transformers.js 本地 embedding） */
  semanticRecommend: true,
  /** 构建时 AI 摘要 */
  aiSummary: true,
  /** 动态时间线 */
  moments: true,
  /** 写作室 */
  editor: true,
  /** 樱花 / 花瓣粒子特效 */
  petals: true,
  /** 滚动进度条 */
  scrollProgress: true,
  /** 明暗主题切换 */
  themeToggle: true,
  /** 站内统计（文章数/分类数/字数） */
  stats: true,
  /** RSS */
  rss: true,
  /** 公告栏 */
  announcement: false,
  /** 友链申请表单 */
  friendsApply: true,
} as const;

/* ============================================================
   Live2D 挂件（右下角悬浮）
   ============================================================ */
export const live2d = {
  /** 默认模型目录名 —— 对应 public/models/<id>/ */
  defaultModel: 'dafeiyu',
  /** 可切换的模型；每个模型需要配套 Cubism Core */
  models: [
    // DeepSeek-chan（大肥鱼）免费公皮 —— 原画：神宫凉子 / 建模：霓虹猫_NeonNeko
    { id: 'dafeiyu', name: '大肥鱼', cubism: 4 },
  ],
  /** 挂件在屏幕上的边距（px） */
  offset: { x: 24, y: 24 },
  /** 挂件尺寸（px） */
  size: { w: 200, h: 260 },
  /** 是否可折叠 */
  collapsible: true,
} as const;

/* ============================================================
   评论系统（Giscus）
   ============================================================ */
export const comments = {
  provider: 'giscus' as 'giscus' | 'none',
  giscus: {
    repo: 'Jiboyu78/zfzblog',
    repoId: 'R_kgDOVe3Qiw',
    category: 'Announcements',
    categoryId: 'DIC_kwDOVe3Qi84DKJMq',
    mapping: 'pathname' as 'pathname' | 'url' | 'title',
    reactionsEnabled: '1' as '0' | '1',
    emitMetadata: '0' as '0' | '1',
    inputPosition: 'bottom' as 'top' | 'bottom',
    lang: 'zh-CN',
    theme: 'preferred_color_scheme',
  },
} as const;

/* ============================================================
   插画图库
   ============================================================ */
export const gallery = {
  /** 放图的目录（相对 public/） */
  dir: '/img/gallery',
  /** 引导页轮播的插画数量 */
  heroCount: 6,
  /** 引导页卡片背景图（可单独指定，优先于随机） */
  heroBackground: '',
  /** 文章封面随机取图 */
  randomCover: true,
} as const;

/* ============================================================
   在线图床（替代 Cloudflare R2，免信用卡）
   ============================================================
   方案：ImgBB（有免费 API + 管理后台，适合博客长期配图）
         Catbox（免注册、200MB、不压缩，适合大文件备选）
   使用方式：
     1. 文章内图片统一写 imageHost.base + 路径，或直接用图床完整 URL；
     2. 本站所有「待替换」的配图先用 /img/placeholder.svg 占位；
     3. 图片到位后，用 PicGo / 网页上传到图床，再把 URL 填进文章。
   ============================================================ */
export const imageHost = {
  /** 当前启用的图床 */
  provider: 'imgbb' as 'imgbb' | 'catbox' | 'none',
  /** ImgBB：上传入口 https://imgbb.com/ （免费 API 需注册后在 https://api.imgbb.com/ 拿 key） */
  imgbb: { uploadUrl: 'https://imgbb.com/', apiDoc: 'https://api.imgbb.com/' },
  /** Catbox：免注册大文件备选 https://catbox.moe/ */
  catbox: { uploadUrl: 'https://catbox.moe/' },
  /** 全站统一占位图（图片未到位前的空图） */
  placeholder: '/img/placeholder.svg',
} as const;

/* ============================================================
   分类 —— 与内容集合 schema 中的 category 字段对应
   ============================================================ */
export const categories = ['OI', 'AI', '工程', '随笔', '比赛'] as const;
