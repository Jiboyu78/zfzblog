/**
 * 配置统一出口
 *
 * 组件里统一从 `@/config` 导入，不要从具体文件导入，
 * 这样以后要重构配置结构，只需改这个文件。
 */

export { site, social, socialIcons, socialKeys, personas, nav, features, live2d, comments, gallery, categories } from './site';
export type { NavItem, SocialKey } from './site';

export { PRESETS, getPreset } from './theme';
export type { PresetId, Palette, ThemePreset } from './theme';

import { site, categories } from './site';
import type { NavItem } from './site';

/**
 * 从实际文章中派生「有内容的分类」列表。
 *
 * 直接用 categories 会为没有文章的分类生成死链（例如分类里列了「随笔」
 * 但一篇随笔都没有，/archive/随笔/ 就不存在）。
 * 这个函数让分类导航永远跟随真实内容。
 */
export function activeCategories(
  posts: { data: { category: string } }[]
): string[] {
  const counts = new Map<string, number>();
  posts.forEach((p) => counts.set(p.data.category, (counts.get(p.data.category) ?? 0) + 1));
  // 按 categories 的声明顺序排列，未声明的新分类追加在后面
  const ordered = categories.filter((c) => counts.has(c)) as string[];
  const extras = [...counts.keys()].filter((c) => !categories.includes(c as any));
  return [...ordered, ...extras];
}

/** 导航是否命中当前路径 */
export function isNavActive(item: NavItem, pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (item.href === '/') return clean === '/';
  return clean === item.href.replace(/\/+$/, '') || clean.startsWith(item.href);
}
