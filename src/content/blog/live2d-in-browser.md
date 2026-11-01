---
title: '浏览器里的 Live2D 看板娘：从能跑到不卡'
description: '用 PixiJS 8 + pixi-live2d-display 接入看板娘，重点记录降级策略、帧率控制、移动端适配这几个真正影响体验的细节。'
pubDate: 2026-07-08
tags: ['Live2D', '前端', '性能优化', 'WebGL']
category: '工程'
weight: 2
---

## 选型

2026 年还在维护的 Live2D 前端库只剩两个：

| 库 | PixiJS | Cubism 支持 | 备注 |
| --- | --- | --- | --- |
| `@jannchie/pixi-live2d-display` | v8 | 2.1 / 4 | 2026 年仍在活跃更新 |
| `@naari3/pixi-live2d-display` | v8 | 5 | 更新频率较低 |

如果你的模型是 Cubism 5（最新的 `model3.json`），用 `@naari3`；Cubism 4 及以下用 `@jannchie`。**两个不要同时装**，它们的 `Live2DModel` 会冲突。

## 授权（最容易踩的坑）

先说清楚授权，因为这是硬约束：

- **Cubism Core 运行时**（`live2dcubismcore.min.js`）是 Live2D Inc. 的专有软件，**不允许再分发**。生产环境必须自己从官网 SDK 里解压后部署，或者用官方 CDN（官方 CDN 稳定性一般，不建议生产用）。
- **官方样例模型**（Shizuku、Haru、Hiyori、Mao、Rice、Nito 等）受 Live2D Free Material License 约束：可以用于个人/研究用途，但**不能改名、不能改设定**，且需要**署名**。
- 从游戏里解包出来的模型：用户协议通常禁止，**不要用于生产站点**。

我的处理：模型文件放 `public/models/` 但在 `.gitignore` 里排除（避免仓库分发问题），页脚固定一行署名。

## 接入代码

```ts
import * as PIXI from 'pixi.js';
import { Live2DModel } from '@jannchie/pixi-live2d-display';

const app = new PIXI.Application();
await app.init({
  width: 220,
  height: 300,
  backgroundAlpha: 0,
  antialias: true,
  resolution: Math.min(window.devicePixelRatio, 2),
  autoDensity: true,
});
document.getElementById('stage')!.appendChild(app.canvas);

const model = await Live2DModel.from('/models/shizuku/shizuku.model3.json', {
  autoInteract: true,
});
app.stage.addChild(model);
```

模型缩放不要写死。不同模型的画布留白差异很大，用内部尺寸算：

```ts
const scale = (stageHeight / 2.2) / model.internalModel.width;
model.scale.set(scale);
model.anchor.set(0.5, 1);   // 底部对齐
model.x = stageWidth / 2;
model.y = stageHeight + 6;
```

## 性能：三个真实有效的优化

实测于一台 2015 款 Intel Iris 6100 的机器：

| 优化 | 优化前 FPS | 优化后 FPS | 内存节省 |
| --- | --- | --- | --- |
| 关闭物理模拟 | 32 | 58 | −18 MB |
| 贴图 2048→1024 | 41 | 52 | −24 MB |
| 精简动作文件 | 45 | 56 | −8 MB |

### 1. 限制空闲帧率

看板娘不需要 60fps。空闲 30fps，交互时拉到 60：

```ts
const originalMax = app.ticker.maxFPS;
app.ticker.maxFPS = 30;

let interacting = false;
const bump = () => {
  if (interacting) return;
  interacting = true;
  app.ticker.maxFPS = 60;
  setTimeout(() => {
    app.ticker.maxFPS = originalMax;
    interacting = false;
  }, 1600);
};
canvas.addEventListener('pointermove', bump, { passive: true });
```

### 2. 页面隐藏时停 ticker

```ts
document.addEventListener('visibilitychange', () => {
  if (document.hidden) app.ticker.stop();
  else app.ticker.start();
});
```

这一条在小程序/WebView 场景里收益最大。

### 3. 鼠标跟踪只在 canvas 附近监听

看板娘只占右下角一个小方块，不该在整个 viewport 上监听 `mousemove`。把监听范围缩小到 canvas 附近，能砍掉绝大部分事件触发。

## 降级链

**这是整个功能里最重要的部分。** 崩溃的看板娘比没有看板娘更糟。

```
检查 WebGL 支持
  ├─ 不支持 → 显示静态立绘，结束
  └─ 支持 → 加载模型
                ├─ 失败 → 静态立绘 + console.warn，结束
                └─ 成功 → 正常渲染
```

```ts
function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
```

加载时机也要压到首屏之后：

```ts
function scheduleIdle(fn: () => void) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: 3000 });
  } else {
    setTimeout(fn, 1500);
  }
}
```

## 移动端

```css
.stage canvas {
  touch-action: none;   /* 防止滑动页面时误触发 */
}
```

不加这个，手机上快速滑动会同时触发页面滚动和看板娘的点击反馈，体验很碎。

另外移动端默认要小一点（220×300 在 375px 宽的屏上太占地方），我改成 150×210。

## 事件重复绑定

这是我第一次写的时候遇到的：点击头部一次，冒出三句不同的反馈。

原因是模块热更新或路由切换时，旧监听没移除，新监听又叠加上去了。

```ts
// 每次初始化前先解绑
canvas.removeEventListener('click', handleClick);
canvas.addEventListener('click', handleClick);
```

更规范的做法是维护一个监听器数组，在卸载时统一移除。

## 切换模型时的黑屏

`destroy()` 和 `create()` 连续调用，Chrome 会把两次 canvas 重绘合并，中间出现 1~2 帧黑屏。加 100ms 延时让浏览器先完成当前帧渲染，黑屏率降到 0。

```ts
await new Promise((r) => setTimeout(r, 100));
```

---

看板娘是个很典型的「锦上添花」功能：做好了加分，没做好扣分。**降级链比渲染效果更重要**——这是我做下来最实在的一条经验。
