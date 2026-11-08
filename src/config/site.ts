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
  netease: { label: '网易云音乐', url: 'https://163cn.tv/bkb8xCmY' },
  email: { label: 'Email', url: 'mailto:caixvkun77851sb@outlook.com' },
} as const;

/**
 * 每个社交平台的品牌色 + 图标文件路径。
 * 图标统一放在 public/img/icons/<key>.svg，social.svg 里渲染时按颜色填充。
 */
export const socialIcons: Record<string, { color: string; icon: string }> = {
  github: { color: '#181717', icon: '/img/icons/github.svg' },
  zhihu: { color: '#0066ff', icon: '/img/icons/zhihu.svg' },
  bilibili: { color: '#00a1d6', icon: '/img/icons/bilibili.svg' },
  netease: { color: '#d43c33', icon: '/img/icons/netease.svg' },
  email: { color: '#5a67d8', icon: '/img/icons/email.svg' },
} as const;

/** 访客可见的社交键（首页 + 关于页 + 页脚用） */
export const socialKeys = ['github', 'zhihu', 'bilibili', 'netease', 'email'] as const;

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
  /** 可切换的模型；每个模型需要配套 Cubism Core。
      file 为模型描述文件名：公皮的实际文件名往往与目录 id 不一致
      （大肥鱼的描述文件是「大肥鱼.model3.json」而非「dafeiyu.model3.json」），
      不写死 ${id}.model3.json，否则构建期探测和运行时加载都会 404。 */
  models: [
    // DeepSeek-chan（大肥鱼）免费公皮 —— 原画：神宫凉子 / 建模：霓虹猫_NeonNeko
    { id: 'dafeiyu', name: '大肥鱼', cubism: 4, file: '大肥鱼.model3.json' },
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
