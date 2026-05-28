# 玻璃窗口模型 — Capsule 展开/折叠动画重构

## 问题

### Bug 1：闪现（展开 & 折叠）
- 展开时内容先完整闪现再被 GSAP 置零后动画展开
- 折叠时胶囊先突缩到 3rem 再被 GSAP 拉回展开高度后动画缩回
- 根因：`v-show` + CSS class 尺寸变更在 GSAP 锁初始值之前被浏览器绘制

### Bug 2：过渡态省略号 / 两行
- 文本在 `nowrap`（折叠）和 `normal`（展开）间切换
- 动画中间态时 `text-overflow: ellipsis` 生效或文本意外折行
- 根因：`white-space` 与 `text-overflow` 在动画过程中改变

## 方案：玻璃窗口

### 核心思想

主文本永远完整渲染。详情（`expanded-content`）用 `v-show` 按需渲染。
胶囊是可变尺寸的「玻璃窗」，用 `overflow: hidden` 裁切溢出内容。

```
折叠 (高=3rem)          展开 (高=内容高度)
┌──────────────┐       ┌──────────────┐
│  ┌─文本─┐    │       │  ┌─文本─┐    │
│  └──────┘    │       │  └──────┘    │
│  ──裁切线──  │       │  ┌─详情─┐    │
└──────────────┘       │  │创建时间│   │
                        │  │分类   │   │
                        │  └──────┘    │
                        └──────────────┘
```

折叠态 3rem 窗口内只有主文本 → `justify-content: center` 将文本垂直居中于 3rem → 文本露在窗口正中。

展开态 `v-show` 渲染详情后，`scrollHeight` 包含完整内容，GSAP 动画扩张高度。

### 关键决策

| 决策 | 理由 |
|------|------|
| 主文本始终渲染，详情 `v-show` | 折叠态 3rem 里只有文本，居中即露文本；不会像全量渲染那样只露内容中间段 |
| `align-items: center` | 水平居中主文本和详情 |
| `justify-content: center` | 垂直居中内容（折叠态 3rem 中文本居中，展开态无效果因容器=内容） |
| 需要 `nextTick` | 等 `v-show` 将详情加入 DOM 后才能读 `scrollHeight` |
| GSAP 不 `clearProps` | 永久由 GSAP 内联高度控制，CSS 不参与尺寸 |

### 原理

```
展开时：
  prevHeight = el.offsetHeight        当前折叠高度 (3rem, GSAP inline)
  await nextTick()                     v-show 渲染详情
  targetHeight = el.scrollHeight      完整内容高度（文本+详情）
  GSAP: height: prev → target         不 clearProps（保留内联高度）

折叠时：
  prevHeight = el.offsetHeight        当前展开高度
  await nextTick()                     v-show 隐藏详情
  targetHeight = 48px (= 3rem)
  GSAP: height: prev → 48             不 clearProps
```

### 动画过程分析（无闪帧）

展开：
1. `expanded = true`
2. Watch 执行 → 读 `prevHeight`（3rem，当前 GSAP 内联值）
3. `await nextTick()` → Vue 渲染详情 DOM，但 `overflow:hidden` 裁切不可见
4. `scrollHeight` 正确包含详情高度
5. GSAP fromTo(3rem → scrollHeight) 启动，无跳变

收回：
1. `expanded = false`
2. Watch 执行 → 读 `prevHeight`（展开高度，GSAP 内联值）
3. `await nextTick()` → Vue 隐藏详情（`display: none`）

## 边界情况

| 场景 | 行为 |
|------|------|
| 内容很短（< 3rem） | 折叠态全部可见，展开和折叠无视觉区别 |
| 单行文本 | 自然折行（短文本不折行），始终 `normal` |
| 双击日历导航 | 滚动到胶囊所在日期，动画不受影响 |
| 双列模式 | `inline-size: 25dvi`，内容在固定宽度内折行 |
| 首次加载 | `onMounted` 用 GSAP.set 锁 3rem，避免初始布局偏移 |
