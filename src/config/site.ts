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
  title: 'Yuki の手账',
  /** 副标题 —— 显示在引导页大字下方 */
  subtitle: 'OI · 多模态 · 工程笔记',
  /** 英文名 / @ handle */
  alternate: 'yuki',
  /** 作者名 */
  author: 'Yuki',
  /** 一句话简介（SEO + 引导页签名） */
  description:
    '一个关于算法竞赛、多模态理解与工程实践的个人站点。写题解，也写踩坑与思考。',
  /** 站点根 URL —— 结尾不要加斜杠 */
  url: 'https://oiblog.example.com',
  /** 头像（引导页中央卡片用） */
  avatar: '/img/avatar.svg',
  /** 建站年份 */
  startYear: 2023,
  /** 时区 */
  timezone: 'Asia/Shanghai',
  /** SEO 关键词 */
  keywords: ['博客', '算法竞赛', 'OI', '多模态', '前端', '工程实践'],
  /** 主题预设 —— 换这一行就能整体换肤 */
  preset: 'sakura' as PresetId,
  /** 每页文章数 */
  postsPerPage: 8,
  /** 备案号 */
  icp: '',
} as const;

/* ============================================================
   社交链接
   ============================================================ */
export const social = {
  github: { label: 'GitHub', url: 'https://github.com/', icon: 'ri:github-fill' },
  zhihu: { label: '知乎', url: 'https://www.zhihu.com/', icon: 'ri:zhihu-fill' },
  email: { label: 'Email', url: 'mailto:yuki@example.com', icon: 'ri:mail-line' },
  telegram: { label: 'Telegram', url: 'https://t.me/', icon: 'ri:telegram-fill' },
  bilibili: { label: 'Bilibili', url: 'https://space.bilibili.com/', icon: 'ri:bilibili-fill' },
  rss: { label: 'RSS', url: '/rss.xml', icon: 'ri:rss-line' },
} as const;

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
    repo: 'username/repo',
    repoId: 'R_kgDOxxxxxx',
    category: 'Announcements',
    categoryId: 'DIC_kwDOxxxxxx',
    mapping: 'pathname' as 'pathname' | 'url' | 'title',
    reactionsEnabled: '1' as '0' | '1',
    emitMetadata: '0' as '0' | '1',
    inputPosition: 'top' as 'top' | 'bottom',
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
