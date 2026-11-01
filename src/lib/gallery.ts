/**
 * 插画图库 —— 构建期扫描 public/ 下的图片目录
 *
 * 设计目标：
 *   1. 用户只需把图片丢进 public/img/gallery/，代码自动收集，无需改配置。
 *   2. 提供「按 id 取图」「随机取图」「取 n 张」三类查询。
 *   3. 全部在构建期执行（Node 环境），零运行时开销。
 */

import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { gallery } from '@/config';

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);

/** 递归扫描目录，返回站内绝对路径（以 / 开头） */
function scan(dir: string, root: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...scan(full, root));
    } else if (IMAGE_EXT.has(extname(name).toLowerCase())) {
      out.push('/' + relative(root, full).split('\\').join('/'));
    }
  }
  return out;
}

let cache: string[] | null = null;

/** 全部图库图片（构建期缓存） */
export function getGalleryImages(): string[] {
  if (cache) return cache;
  const root = join(process.cwd(), 'public');
  const dir = join(root, gallery.dir.replace(/^\//, ''));
  const images = scan(dir, root).sort();
  cache = images;
  return images;
}

/** 随机取 n 张（不足则循环补齐） */
export function pickRandomImages(n: number, exclude: string[] = []): string[] {
  const pool = getGalleryImages().filter((p) => !exclude.includes(p));
  if (!pool.length) return [];
  const out: string[] = [];
  let bag = [...pool];
  while (out.length < n) {
    if (!bag.length) bag = [...pool];
    const i = Math.floor(Math.random() * bag.length);
    out.push(bag.splice(i, 1)[0]);
  }
  return out;
}

/** 按图片文件名（不含扩展名）精确匹配 */
export function findImageByName(name: string): string | undefined {
  const target = name.toLowerCase();
  return getGalleryImages().find((p) => {
    const base = p.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
    return base === target;
  });
}

/**
 * 解析文章封面：
 *   1. frontmatter 显式指定 cover/heroImage → 直接用
 *   2. 否则按 id 从图库中找同名图
 *   3. 都没有 → 返回 undefined，由调用方决定是否随机
 */
export function resolveCover(
  id: string,
  explicit?: string
): string | undefined {
  if (explicit) return explicit;
  return findImageByName(id);
}
