/// <reference types="astro/client" />

/**
 * 构建期注入的常量（见 astro.config.mjs 的 vite.define）
 *
 * __LIVE2D_ENABLED__ 为 false 时：
 *   - 看板娘走静态立绘降级
 *   - Pixi.js / Cubism4 渲染器不会被打包进产物
 */
declare const __LIVE2D_ENABLED__: boolean;
