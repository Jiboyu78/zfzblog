import momentsRaw from '@/data/moments.json';

/** 一条静态动态 */
export interface Moment {
  /** ISO 8601 时间字符串，同时作为唯一 id */
  id: string;
  /** 正文 */
  content: string;
  /** 配图（相对 public/ 或完整 URL） */
  images?: string[];
  /** 标签 */
  tags?: string[];
  /** 心情标记（emoji 风格：happy / calm / tired ...） */
  mood?: string;
}

/**
 * 按时间倒序返回全部动态。
 * id 是带时区的 ISO 字符串，localeCompare 即可正确排序。
 */
export function getMoments(): Moment[] {
  return [...momentsRaw].sort((a, b) => b.id.localeCompare(a.id));
}
