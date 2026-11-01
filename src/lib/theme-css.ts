/**
 * 主题 CSS 变量生成
 *
 * 机制：
 *   1. Tailwind v4 的 `@theme inline` 把工具类指向运行时变量
 *      （如 `bg-primary` → `background-color: var(--t-primary)`）。
 *   2. 本模块把 config/theme.ts 里的预设展开成 `--t-*` 变量，
 *      由 BaseLayout 以内联 <style> 注入 <html>。
 *   3. 换 preset = 换一份变量，不需要重新编译 Tailwind 工具类。
 */

import { getPreset } from '@/config/theme';
import { site } from '@/config/site';
import type { Palette } from '@/config/theme';

function paletteVars(p: Palette) {
  return {
    '--t-primary': p.primary,
    '--t-primary-light': p.primaryLight,
    '--t-primary-dark': p.primaryDark,
    '--t-accent': p.accent,
    '--t-accent-alt': p.accentAlt,
    '--t-bg': p.bg,
    '--t-bg-soft': p.bgSoft,
    '--t-bg-card': p.bgCard,
    '--t-ink': p.ink,
    '--t-ink-strong': p.inkStrong,
    '--t-ink-mute': p.inkMute,
    '--t-line': p.line,
    '--t-line-soft': p.lineSoft,
    '--t-code': p.code,
    '--t-code-bg': p.codeBg,
    '--t-shadow-color': p.shadowColor,
    '--t-gradient-from': p.gradientFrom,
    '--t-gradient-to': p.gradientTo,
  };
}

/** 明亮模式下 :root 的变量 */
export function lightVars(): Record<string, string> {
  const preset = getPreset(site.preset);
  return {
    ...paletteVars(preset.light),
    '--t-radius-sm': preset.radius.sm,
    '--t-radius-md': preset.radius.md,
    '--t-radius-lg': preset.radius.lg,
    '--t-radius-xl': preset.radius.xl,
    '--t-radius-full': preset.radius.full,
    '--t-shadow-card': preset.shadow.card,
    '--t-shadow-float': preset.shadow.float,
    '--t-shadow-button': preset.shadow.button,
    '--t-shadow-glow': preset.shadow.glow,
    '--t-reveal-distance': preset.motion.revealDistance,
    '--t-duration': preset.motion.duration,
    '--t-ease': preset.motion.ease,
    '--t-texture': preset.light.texture || 'none',
  };
}

/** 暗色模式下 html.dark 的变量 */
export function darkVars(): Record<string, string> {
  const preset = getPreset(site.preset);
  return {
    ...paletteVars(preset.dark),
    '--t-texture': preset.dark.texture || 'none',
  };
}

/** 生成完整的 <style> 文本 */
export function themeStyleText(): string {
  const l = lightVars();
  const d = darkVars();
  const decl = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n');
  return `:root {\n${decl(l)}\n}\n\nhtml.dark {\n${decl(d)}\n}\n`;
}
