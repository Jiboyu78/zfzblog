/**
 * 主题预设 —— 全站视觉的单一真相源
 *
 * 设计意图：
 *   1. 颜色、圆角、阴影、字体、动效参数全部收在这里，CSS 只消费变量。
 *   2. 提供多套预设（sakura / snow / mono），换肤只需改 site.ts 的 preset 字段，
 *      不需要碰任何组件或样式表 —— 这是「开源模板 + 高度可配置」的地基。
 *   3. 每套预设都同时给出 light / dark 两套色板，暗色不是简单反色，
 *      而是重新配过对比度的独立色板。
 *
 * 预设来源：
 *   sakura — astro-koharu（余弦の博客）：樱花色系、插画头图、波浪分割、大圆角白卡
 *   snow   — astro-snow（雪花的博客）：粉蓝渐变、网格纸底、20px 圆角、药丸按钮
 *   mono   — cnblogs SimpleMemory（SilverGo）：等宽极简、青蓝主色、零圆角
 */

export type PresetId = 'sakura' | 'snow' | 'mono';

export interface Palette {
  /** 主色 */
  primary: string;
  primaryLight: string;
  primaryDark: string;
  /** 渐变副色（用于按钮、封面色带） */
  accent: string;
  accentAlt: string;
  /** 背景层 */
  bg: string;
  bgSoft: string;
  bgCard: string;
  /** 文字层 */
  ink: string;
  inkStrong: string;
  inkMute: string;
  /** 线条 */
  line: string;
  lineSoft: string;
  /** 代码 */
  code: string;
  codeBg: string;
  /** 阴影基色 */
  shadowColor: string;
  /** 渐变起止 */
  gradientFrom: string;
  gradientTo: string;
  /** 页面底纹（可为空） */
  texture: string;
}

export interface ThemePreset {
  id: PresetId;
  label: string;
  description: string;
  light: Palette;
  dark: Palette;
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadow: {
    card: string;
    float: string;
    button: string;
    glow: string;
  };
  font: {
    display: string;
    sans: string;
    mono: string;
  };
  motion: {
    /** 滚动揭示的位移距离 */
    revealDistance: string;
    /** 常规动效时长 */
    duration: string;
    /** 缓动曲线 */
    ease: string;
  };
}

const sakura: ThemePreset = {
  id: 'sakura',
  label: '樱花',
  description: 'astro-koharu 风格：樱花色系、插画头图、波浪分割、大圆角白卡',
  light: {
    primary: '#e95469',
    primaryLight: '#ff6b7a',
    primaryDark: '#d63f55',
    accent: '#ed6ea0',
    accentAlt: '#ec8c69',
    bg: '#fdfbfb',
    bgSoft: '#f5f1f2',
    bgCard: '#fdfbfb',
    ink: '#32292c',
    inkStrong: '#241c1e',
    inkMute: '#8b7c7f',
    line: '#eae1e4',
    lineSoft: '#f4eef0',
    code: '#c2405c',
    codeBg: '#fdf0f3',
    shadowColor: '40, 12, 32',
    gradientFrom: '#ed6ea0',
    gradientTo: '#ec8c69',
    texture: '',
  },
  dark: {
    primary: '#ff7d90',
    primaryLight: '#ff9aa8',
    primaryDark: '#e05a6e',
    accent: '#f07aa8',
    accentAlt: '#f09a72',
    bg: '#1e191b',
    bgSoft: '#272124',
    bgCard: '#241e20',
    ink: '#e2d8da',
    inkStrong: '#f6eef0',
    inkMute: '#9c8c90',
    line: '#3a2f33',
    lineSoft: '#30272a',
    code: '#ff8fa3',
    codeBg: '#2f2226',
    shadowColor: '0, 0, 0',
    gradientFrom: '#f07aa8',
    gradientTo: '#f09a72',
    texture: '',
  },
  radius: { sm: '8px', md: '12px', lg: '16px', xl: '20px', full: '9999px' },
  shadow: {
    card: '0 16px 32px -20px rgba(40, 12, 32, 0.35), 0 1px 0 rgba(234, 225, 228, 0.8) inset',
    float: '0 12px 32px -16px rgba(233, 84, 107, 0.3)',
    button: '0 10px 20px -12px rgba(233, 83, 106, 0.75)',
    glow: '0 0 0 3px rgba(233, 83, 106, 0.12)',
  },
  font: {
    display: "'Maple Mono', 'PingFang SC', system-ui, sans-serif",
    sans: "'Maple Mono', 'PingFang SC', 'Microsoft Yahei', system-ui, sans-serif",
    mono: "'Maple Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
  },
  motion: { revealDistance: '20px', duration: '0.6s', ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
};

const snow: ThemePreset = {
  id: 'snow',
  label: '雪',
  description: 'astro-snow 风格：粉蓝渐变、网格纸底、20px 圆角、药丸按钮',
  light: {
    primary: '#ff69b4',
    primaryLight: '#ff8fc8',
    primaryDark: '#d94a92',
    accent: '#00a1d6',
    accentAlt: '#7f9cf5',
    bg: '#f8fafc',
    bgSoft: '#f1f5f9',
    bgCard: '#ffffff',
    ink: '#0f172a',
    inkStrong: '#020617',
    inkMute: '#64748b',
    line: '#e2e8f0',
    lineSoft: '#f1f5f9',
    code: '#e11d48',
    codeBg: '#fff1f2',
    shadowColor: '15, 23, 42',
    gradientFrom: '#ff7aa2',
    gradientTo: '#ff4f87',
    texture:
      'repeating-linear-gradient(90deg, rgba(15,23,42,0.02) 0 1px, transparent 1px 90px), repeating-linear-gradient(0deg, rgba(15,23,42,0.02) 0 1px, transparent 1px 90px)',
  },
  dark: {
    primary: '#ff7ec0',
    primaryLight: '#ffa8d8',
    primaryDark: '#e85aa5',
    accent: '#38bdf8',
    accentAlt: '#8b9cf7',
    bg: '#0f172a',
    bgSoft: '#1e293b',
    bgCard: '#172033',
    ink: '#cbd5e1',
    inkStrong: '#f1f5f9',
    inkMute: '#7c8ba1',
    line: '#2b3a52',
    lineSoft: '#223047',
    code: '#fb7185',
    codeBg: '#2a1a22',
    shadowColor: '0, 0, 0',
    gradientFrom: '#ff7aa2',
    gradientTo: '#ff4f87',
    texture:
      'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 90px), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 90px)',
  },
  radius: { sm: '10px', md: '14px', lg: '20px', xl: '25px', full: '9999px' },
  shadow: {
    card: '0 10px 40px rgba(255, 105, 180, 0.3)',
    float: '0 12px 32px -16px rgba(255, 105, 180, 0.28)',
    button: '0 10px 20px -12px rgba(255, 79, 135, 0.8)',
    glow: '0 0 0 3px rgba(255, 105, 180, 0.14)',
  },
  font: {
    display: "'Maple Mono', 'PingFang SC', system-ui, sans-serif",
    sans: "'Maple Mono', 'PingFang SC', 'Microsoft Yahei', system-ui, sans-serif",
    mono: "'Maple Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
  },
  motion: { revealDistance: '18px', duration: '0.55s', ease: 'cubic-bezier(0.34, 1.4, 0.64, 1)' },
};

const mono: ThemePreset = {
  id: 'mono',
  label: '等宽',
  description: 'SimpleMemory 风格：等宽极简、青蓝主色、零圆角、细线分隔',
  light: {
    primary: '#21759b',
    primaryLight: '#3671a5',
    primaryDark: '#0f3647',
    accent: '#807dd4',
    accentAlt: '#9fb6c9',
    bg: '#ffffff',
    bgSoft: '#fbfbfb',
    bgCard: '#ffffff',
    ink: '#333333',
    inkStrong: '#3a4145',
    inkMute: '#757575',
    line: '#ededed',
    lineSoft: '#f5f5f5',
    code: '#d83b64',
    codeBg: '#f9f2f4',
    shadowColor: '58, 65, 69',
    gradientFrom: '#21759b',
    gradientTo: '#4a90b8',
    texture: '',
  },
  dark: {
    primary: '#7fb0e0',
    primaryLight: '#a3c9ec',
    primaryDark: '#4f8bb8',
    accent: '#a5a2e8',
    accentAlt: '#7e9bb8',
    bg: '#1a1c1f',
    bgSoft: '#222529',
    bgCard: '#1e2124',
    ink: '#c8ccd0',
    inkStrong: '#e6e9ec',
    inkMute: '#7d858c',
    line: '#33383d',
    lineSoft: '#2a2e33',
    code: '#f08ca8',
    codeBg: '#2b2126',
    shadowColor: '0, 0, 0',
    gradientFrom: '#4f8bb8',
    gradientTo: '#7fb0e0',
    texture: '',
  },
  radius: { sm: '3px', md: '4px', lg: '6px', xl: '8px', full: '9999px' },
  shadow: {
    card: '0 2px 10px -6px rgba(58, 65, 69, 0.25)',
    float: '0 10px 30px -14px rgba(92, 142, 198, 0.45)',
    button: '0 4px 12px -6px rgba(33, 117, 155, 0.6)',
    glow: '0 0 0 3px rgba(33, 117, 155, 0.14)',
  },
  font: {
    display: "'Maple Mono', 'PingFang SC', system-ui, sans-serif",
    sans: "'Maple Mono', 'PingFang SC', 'Microsoft Yahei', system-ui, sans-serif",
    mono: "'Maple Mono', 'JetBrains Mono', Menlo, Consolas, monospace",
  },
  motion: { revealDistance: '14px', duration: '0.5s', ease: 'cubic-bezier(0.4, 0, 0.2, 1)' },
};

export const PRESETS: Record<PresetId, ThemePreset> = { sakura, snow, mono };

export function getPreset(id: PresetId): ThemePreset {
  return PRESETS[id] ?? sakura;
}
