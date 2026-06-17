# Gate-Gap 门缝交互设计

## 概述

双列模式下，左右两列之间的一条竖线（门缝），hover 时向两侧推开，露出圆形按钮。

## 架构

```
.double-shelf (display: flex; flex-direction: row)
├── .timeline-column (flex: 1)        左列 — 日程胶囊
├── .gate-gap (inline-size: 0.125rem) 门
│   └── .gate-btn ×6                  按钮（单 / + / ··· / 字 / ☀️🌙 / ⇅）
└── .unscheduled-column (flex: 1)     右列 — 无日程胶囊
```

## 门 `.gate-gap`

### 常态与 hover

| 状态 | inline-size | 行为 |
|---|---|---|
| 默认 | `0.125rem` | 细竖线，背景色 `var(--calendar-grid-line)` |
| hover | `4rem` | 向两侧推开两列，按钮淡入 |

### 鼠标位置固定

- `@pointerenter` 事件捕获一次鼠标 Y 坐标，存入 `--hover-y`
- `@pointerleave` 不做任何重置（避免闪现）
- 按钮组 `transform: translateY(calc(var(--hover-y) - 50%))` 固定在该位置
- **不是** `@pointermove`，hover 期间按钮位置不变

### 六个按钮

竖直排列，圆形：

| 位置 | 文本 | 功能 |
|---|---|---|
| 1 | `单` | 切换到单列模式 |
| 2 | `+` | 打开新建胶囊对话框 |
| 3 | `···` | 循环筛选模式（全部 → 首尾 → 首日 → 末日） |
| 4 | `字` | 循环切换正文字体 |
| 5 | `☀️` / `🌙` | 切换亮色/暗色主题 |
| 6 | `⇅` | 打开 JSON 导入/导出对话框 |

## 浮动球 FAB

单列模式下，胶囊列表右侧居中的一个圆形浮动按钮，用于快速新建胶囊。

### 位置

```
.capsule-container
├── .single-shelf          ← 胶囊列表（右对齐）
├── .fab                   ← 圆形 + 号（position: absolute; left: 100%; top: 50%）
├── .double-shelf
```

### 行为

| 模式 | 显示 | 点击 |
|---|---|---|
| 单列 | ✅ 显示 | 打开新建 modal（无日程，空白） |
| 双列 | ❌ 隐藏 | —（门里已经有 + 号） |

### 动画跟随

FAB 在模式切换时与 `.single-shelf` 绑定在同一个 GSAP timeline 里。单列 → 双列时一起右移淡出，双列 → 单列时从右侧滑入。

## GSAP 动画（替代 `document.startViewTransition`）

所有动画使用 **translateX 滑动平移**，不涉及 clip-path。

### `switchViewMode('double')`

```
① .single-shelf 整体 translateX(100dvi) + opacity: 0  0.45s power2.in
    — 动画期间 overflow: visible（飞出窗口不被裁切）
    — onComplete: overflow 恢复 + clearProps: all（清 GSAP 内联样式）
② store.setViewMode('double')
③ .gate-gap opacity: 0 → 1
④ 两列从门外侧滑入门（初始位置 x: ±shelfW，以 .double-shelf 宽度为准）：
    .timeline-column      x: shelfW  →  0
    .unscheduled-column   x: -shelfW →  0
    0.55s backOut(1.2)，同时滑入
    — overflow: hidden 裁剪门外的部分
```

### `switchViewMode('single')`

```
① 两列向门外侧滑出（目标位置 x: ±shelfW）：
    .timeline-column      x: 0  →  shelfW
    .unscheduled-column   x: 0  →  -shelfW
    0.4s power1.inOut，同时滑出
    .gate-gap opacity: 1 → 0 (0.15s)
② store.setViewMode('single')
③ .single-shelf 在 setViewMode 前已预置 x: 100dvi, opacity: 0（避免闪白）
④ 从 x: 100dvi → 0  0.45s power2.out
    — onComplete: overflow 恢复 + clearProps: all
```

### 动画关键实现细节

- `.double-shelf` 有 `overflow: hidden`，滑出父容器的部分自然被裁切
- 滑出距离 `shelfW` 取 `.double-shelf.offsetWidth`，保证完全移出视野
- 两列在动画结束后有 `clearProps: all` 清掉 GSAP 内联样式，防止 GPU 合成层残留导致文字模糊
- `.capsule-container` 无 `will-change`，避免 GPU 层全时开启
- `switchViewMode` 返回 `Promise<void>`，caller 可 await 动画完成

## 日期选中滚动

通过 `useCalendarAction` 事件总线传递 `navigateToDate` 信号。`CapsuleShelf.vue` 监听此信号：

```ts
watch(() => navigateToDate.value, async (newDate) => {
  if (!newDate) return
  if (store.viewMode !== 'double') {
    await switchViewMode('double')
  }
  await nextTick()
  // 从 timeline 列中查找 data-need-to-be-scrolled-date 元素
  // 精确匹配 → 不存在则找最近日期（等距取未来日期）
  // scrollIntoView({ behavior: 'smooth', block: 'start' })
  setTimeout(() => { navigateToDate.value = '' })
})
```

## 数据加载

- `onMounted` 加载全量胶囊
- 展开动画结束后按需加载（当前全量加载，后续异步优化）

## CSS 单位

全 `rem` / `dvi` / `dvb`，零 `px`。
