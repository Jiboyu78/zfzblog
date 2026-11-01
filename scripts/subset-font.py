#!/usr/bin/env python3
"""
字体子集化脚本 —— 把 Maple Mono 变体字体裁剪到「站点实际用到的字符」

为什么必须做：
  Maple Mono CN 完整版 150MB+，直接引用会让首屏加载几十秒。
  中文字体 web font 的正确做法是子集化：只保留文章与界面里真正出现的字。

产出：
  public/fonts/maple-mono-subset.woff2   (400 字重)
  public/fonts/maple-mono-subset-700.woff2 (700 字重)

用法：
  python3 scripts/subset-font.py /path/to/MapleMono[wght].ttf
"""

import os
import re
import sys
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, 'public', 'fonts')

# 收集站点所有文本：文章 + 组件 + 页面 + 脚本里的中文与符号
SOURCE_DIRS = [
    os.path.join(ROOT, 'src'),
]


def collect_chars() -> set:
    chars = set()

    # 1. 扫描 src/ 下所有文本文件
    for src_dir in SOURCE_DIRS:
        for path in glob.glob(os.path.join(src_dir, '**', '*'), recursive=True):
            if not os.path.isfile(path):
                continue
            if not path.endswith(('.astro', '.ts', '.js', '.md', '.mdx', '.css', '.yml')):
                continue
            try:
                with open(path, encoding='utf-8') as f:
                    chars.update(f.read())
            except (UnicodeDecodeError, OSError):
                continue

    # 2. 扫描 public/ 下的静态资源
    for path in glob.glob(os.path.join(ROOT, 'public', '**', '*'), recursive=True):
        if not os.path.isfile(path):
            continue
        if not path.endswith(('.html', '.txt', '.yml', '.svg')):
            continue
        try:
            with open(path, encoding='utf-8') as f:
                chars.update(f.read())
        except (UnicodeDecodeError, OSError):
            continue

    # 3. 补上界面里可能出现但源码里没有的常用字
    extra = (
        '零一二三四五六七八九十百千万亿'
        '年月日时分秒星期周月'
        '文章目录首页标签归档关于友链搜索写作阅读评论推荐置顶'
        '分类全部更多展开收起返回顶部复制粘贴下载上传导入导出'
        '上一篇下一篇返回首页订阅发布更新浏览量赞评论数'
        '题目解答思路证明算法复杂度代码实现分析总结'
        '学习笔记记录思考实践项目开发部署测试上线版本'
        '个人博客网站主页专栏系列教程指南参考手册工具箱'
        '友链申请二维码赞赏捐赠支持鼓励交流合作联系邮箱'
        '查看更多加载中暂无暂无数据空状态错误失败成功'
        '设置主题明暗模式切换夜间白天跟随系统偏好设置项'
        '插件看板娘模型切换隐藏显示互动对话气泡语音'
        '数学公式定理推导结论注意警告提示信息错误码'
    )
    chars.update(extra)

    # 4. 常用标点、符号、数字、拉丁字母（保证任何动态内容都能显示）
    chars.update(chr(c) for c in range(0x20, 0x7F))
    chars.update('　，。！？；：、（）「」『』《》【】—…·～￥％＋－×÷＝＜＞／＼｜“”‘’')
    chars.update('←→↑↓↔⇄✕✓▌●○◆◇■□▲△▼▽★☆♪♫')
    chars.update('①②③④⑤⑥⑦⑧⑨⑩')
    chars.update('πΣΩαβγθλμσφω')
    chars.update('，。！？；：、（）《》【】“”‘’…—')

    # 去掉控制字符
    return {c for c in chars if ord(c) >= 0x20 or c == '\n'}


def main():
    if len(sys.argv) < 2:
        print('用法: python3 scripts/subset-font.py <MapleMono[wght].ttf>')
        sys.exit(1)

    src_font = sys.argv[1]
    if not os.path.exists(src_font):
        print(f'找不到字体文件: {src_font}')
        sys.exit(1)

    os.makedirs(FONT_DIR, exist_ok=True)

    chars = collect_chars()
    # 只保留可打印字符
    text = ''.join(sorted(c for c in chars if c.isprintable() or c == ' '))
    print(f'收集到 {len(text)} 个唯一字符')

    # 生成字符集文件
    charset_file = os.path.join('/tmp', 'maple_subset_chars.txt')
    with open(charset_file, 'w', encoding='utf-8') as f:
        f.write(text)

    from fontTools import subset
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer

    for weight, out_name in [(400, 'maple-mono-subset.woff2'),
                             (700, 'maple-mono-subset-700.woff2')]:
        out_path = os.path.join(FONT_DIR, out_name)

        # 1. 从可变字体实例化出固定字重
        font = TTFont(src_font)
        static_font = instancer.instantiateVariableFont(font, {'wght': weight})
        static_font.save('/tmp/_static.ttf')

        # 2. 子集化
        options = subset.Options()
        options.flavor = 'woff2'
        options.desubroutinize = True
        options.layout_features = ['*']   # 保留连字 calt / liga
        options.name_IDs = ['*']
        options.notdef_outline = True
        options.recalc_bounds = True

        subsetter = subset.Subsetter(options=options)
        subsetter.populate(text=text)
        sub_font = TTFont('/tmp/_static.ttf')
        subsetter.subset(sub_font)
        sub_font.flavor = 'woff2'
        sub_font.save(out_path)
        sub_font.close()

        size_kb = os.path.getsize(out_path) / 1024
        print(f'  ✓ {out_name}  {size_kb:.1f} KB  (wght={weight})')


if __name__ == '__main__':
    main()
