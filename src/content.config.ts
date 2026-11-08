// Astro 内容集合配置（Astro 7 Content Layer API）
// 注意：Astro 7 中配置文件必须是 src/content.config.ts，旧的 src/content/config.ts 会被完全忽略。
// 集合一律使用 loader（glob/file），不再支持旧的 `type: 'content'` 写法。
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().max(80),
    description: z.string().max(200).optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    /** 显式封面（优先于图库随机） */
    cover: z.string().optional(),
    /** AI 创作标签：写作后台手动选择（human 人类手写 / co 与 AI 合写 / ai AI 主笔） */
    aiTag: z.enum(['human', 'co', 'ai']).default('human'),
    tags: z.array(z.string()).default([]),
    category: z.enum(['OI', 'AI', '工程', '随笔', '比赛']).default('随笔'),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    /** 阅读时长权重系数：算法题解偏长，随笔偏短 */
    weight: z.number().default(1),
    /** 目录自动编号开关 */
    tocNumbering: z.boolean().default(true),
    /** 兼容 koharu 的 toc-no-numbering */
    noNumbering: z.boolean().default(false),
    /** 加密文章（防君子不防小人） */
    password: z.string().optional(),
    /** 系列文章 */
    series: z.string().optional(),
  }),
});

const links = defineCollection({
  loader: glob({ base: './src/data/links', pattern: '**/*.json' }),
  schema: z.object({
    name: z.string(),
    url: z.string().url(),
    avatar: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { blog, links };
