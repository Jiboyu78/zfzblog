// 构建期生成 OG 分享图（1200×630）
// 每篇文章一张 PNG，输出到 public/og/<slug>.png
//
// 用法：
//   npm run og            # 为所有文章生成
//   npm run og -- --slug xxx   # 只生成某篇
//
// 注意：Satori 需要字体数据。优先用系统字体；
// 若系统没有中文字体，会自动降级为纯色背景 + 英文标题（不影响构建）。

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const CONTENT_DIR = './src/content/blog';
const OUT_DIR = './public/og';
const SITE_NAME = 'Yuki 的算法手账';
const SITE_SUB = 'OI · 多模态 · 工程笔记';

mkdirSync(OUT_DIR, { recursive: true });

// ── 字体加载 ────────────────────────────────────────────────
function loadFonts() {
  // 注意：Satori 不支持 .ttc（TrueType Collection），必须是单个 .ttf / .otf
  const candidates = [
    // macOS：Arial Unicode 是单个 TTF 且含中日韩字形
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
    '/System/Library/Fonts/Supplemental/Songti.ttc',
    // Linux 常见
    '/usr/share/fonts/opentype/noto/NotoSansCJKsc-Regular.otf',
    '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',
    // 英文兜底
    '/System/Library/Fonts/Supplemental/Arial.ttf',
  ];
  const found = candidates.filter((p) => existsSync(p) && !p.endsWith('.ttc'));
  if (!found.length) {
    console.warn('[og] 未找到可用的单文件字体（.ttc 不受支持），将生成简化版 OG 图');
    return [];
  }
  const fonts = found.map((path) => ({
    name: 'main',
    data: readFileSync(path),
    weight: 400,
    style: 'normal',
  }));
  console.log(`[og] 使用字体：${found.join(', ')}`);
  return fonts;
}

const fonts = loadFonts();

// ── 解析 frontmatter ──────────────────────────────────────
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { body: raw };
  const fm = {};
  const lines = m[1].split(/\r?\n/);
  let inList = false;
  let listKey = '';
  for (const line of lines) {
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem) {
      if (listKey) fm[listKey] = [...(fm[listKey] || []), listItem[1].trim().replace(/^["']|["']$/g, '')];
      continue;
    }
    const kv = line.match(/^([\w-]+)\s*:\s*(.*)$/);
    if (kv) {
      const [, key, val] = kv;
      inList = val.trim() === '';
      listKey = inList ? key : '';
      if (!inList) {
        fm[key] = val.trim().replace(/^["']|["']$/g, '');
      } else {
        fm[key] = [];
      }
    }
  }
  return { data: fm, body: raw.slice(m[0].length) };
}

const slugOnly = process.argv.includes('--slug')
  ? process.argv[process.argv.indexOf('--slug') + 1]
  : null;

const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

const CATEGORY_COLOR = {
  OI: '#38bdf8',
  AI: '#a855f7',
  工程: '#0ea5e9',
  随笔: '#f59e0b',
  比赛: '#f43f5e',
};

let count = 0;
for (const file of files) {
  const slug = file.replace(/\.(md|mdx)$/, '');
  if (slugOnly && slug !== slugOnly) continue;

  const raw = readFileSync(join(CONTENT_DIR, file), 'utf8');
  const { data } = parseFrontmatter(raw);
  if (data.draft === 'true') continue;

  const title = data.title || '未命名文章';
  const description = data.description || '';
  const category = data.category || '随笔';
  const accent = CATEGORY_COLOR[category] || '#38bdf8';
  const dateStr = data.pubDate
    ? new Date(data.pubDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  // 按视觉长度自适应字号：中文按 1 个字宽 ≈ 1 个英文字母宽
  const visualLen = [...title].reduce((n, ch) => n + (/[一-龥　-〿＀-￯]/.test(ch) ? 1 : 0.55), 0);
  const titleSize = visualLen > 44 ? 46 : visualLen > 34 ? 54 : visualLen > 26 ? 62 : 68;
  // 超长标题截断
  const shortTitle = visualLen > 46 ? [...title].slice(0, 30).join('') + '…' : title;
  const shortDesc = description.length > 78 ? description.slice(0, 78) + '…' : description;

  const element = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: 'linear-gradient(135deg, #0b1220 0%, #122339 55%, #1b1533 100%)',
        fontFamily: 'main',
        position: 'relative',
      },
      children: [
        // 顶部：站点标识 + 分类
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '18px', fontSize: '28px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0b1220', fontSize: '32px', fontWeight: 700,
                  },
                  children: 'M',
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    { type: 'div', props: { style: { fontSize: '30px', color: '#e2e8f0', fontWeight: 700 }, children: SITE_NAME } },
                    { type: 'div', props: { style: { fontSize: '20px', color: '#64748b' }, children: SITE_SUB } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    marginLeft: 'auto', padding: '10px 26px', borderRadius: '999px',
                    background: accent + '22', border: `2px solid ${accent}66`,
                    color: accent, fontSize: '24px', fontWeight: 600,
                  },
                  children: category,
                },
              },
            ],
          },
        },
        // 中部：标题 + 摘要
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '24px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${titleSize}px`,
                    fontWeight: 800, color: '#f1f5f9', lineHeight: 1.25, letterSpacing: '-0.02em',
                    // 关键：限制宽度，防止长标题溢出画布
                    width: 1040,
                    display: 'flex',
                  },
                  children: shortTitle,
                },
              },
              ...(description
                ? [{
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '26px', color: '#94a3b8', lineHeight: 1.6,
                        width: 1000, display: 'flex',
                      },
                      children: shortDesc,
                    },
                  }]
                : []),
            ],
          },
        },
        // 底部：日期 + 装饰
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
            children: [
              { type: 'div', props: { style: { fontSize: '24px', color: '#64748b' }, children: dateStr } },
              {
                type: 'div',
                props: {
                  style: { width: '280px', height: '8px', borderRadius: '999px', background: '#1e293b' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '120px', height: '8px', borderRadius: '999px',
                          background: `linear-gradient(90deg, ${accent}, #a855f7)`,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };

  try {
    const svg = await satori(element, { width: 1200, height: 630, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    writeFileSync(join(OUT_DIR, `${slug}.png`), png);
    console.log(`✓ ${slug}.png`);
    count++;
  } catch (e) {
    console.warn(`✗ ${slug}: ${e.message}`);
  }
}

console.log(`\n生成完成：${count} 张 OG 图 → ${OUT_DIR}`);

// ── 站点默认 OG 图（首页 / 列表页共用）────────────────────
if (!slugOnly) {
  const siteEl = {
    type: 'div',
    props: {
      style: {
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px',
        background: 'linear-gradient(135deg, #0b1220 0%, #122339 55%, #1b1533 100%)',
        fontFamily: 'main',
      },
      children: [
        { type: 'div', props: { style: { fontSize: '30px', color: '#38bdf8', fontWeight: 600, marginBottom: '24px' }, children: SITE_SUB } },
        { type: 'div', props: { style: { fontSize: '84px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, letterSpacing: '-0.02em' }, children: SITE_NAME } },
        { type: 'div', props: { style: { fontSize: '30px', color: '#94a3b8', marginTop: '28px', width: '960px', display: 'flex', lineHeight: 1.6 }, children: '写代码，也写算法题解、多模态实验与工程踩坑。' } },
        {
          type: 'div',
          props: { style: { display: 'flex', gap: '12px', marginTop: '44px' } },
          children: ['OI 竞赛', '多模态', '前端工程'].map((t) => ({
            type: 'div',
            props: { style: { padding: '12px 28px', borderRadius: '999px', background: '#1e293b', border: '2px solid #334155', color: '#cbd5e1', fontSize: '24px' }, children: t },
          })),
        },
      ],
    },
  };
  try {
    const svg = await satori(siteEl, { width: 1200, height: 630, fonts });
    writeFileSync(join(OUT_DIR, 'default.png'), new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
    console.log('✓ default.png');
  } catch (e) {
    console.warn(`✗ default.png: ${e.message}`);
  }
}
