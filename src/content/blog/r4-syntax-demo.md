---
title: R4 语法全家桶演示
description: Shoka 容器、KaTeX、注音、剧透、行内效果、答题块、加密块、代码工具栏的完整演示。
pubDate: 2026-11-01
category: 工程
tags: [Markdown, Shoka, 语法]
cover: /img/placeholder.svg
---

本文用于验收 R4「Markdown 增强全家桶」的全部语法。

## Shoka 容器

:::tip 一个提示

这是 tip 容器，支持任意 markdown 内容。

:::

:::warning 注意

这是 warning 容器。

:::

:::danger 危险

这是 danger 容器。

:::

:::details 点我展开

这是折叠容器里的内容。

:::

## 公式与注音

质能方程 $E = mc^2$，以及勾股定理：

$$a^2 + b^2 = c^2$$

汉字可以注音：{汉字^han4 zi4}，数学里的 $x^2$ 不会被误伤。

## 剧透与行内效果

这是一段 !!隐藏的剧透内容!! 文字。

支持 ++下划线++、==高亮==、~下标~、^上标^。

## 答题块

```quiz
question: 下面哪个是 O(n log n)？
options:
  - 归并排序
  - 冒泡排序
  - 插入排序
answer: 0
explanation: 归并排序是典型分治，O(n log n)。
```

## 加密内容块

:::encrypted{password="fish"}

这是加密内容，密码是 `fish`。

:::

## 代码块工具栏

```python
def hello():
    print("右上角应有复制/全屏工具栏")
```
