# MVP 第一阶段：搭骨架

> 目标：Centro 左右布局 + 日历点击选日期 + 三态高亮 + CapsuleShelf 显示胶囊列表
> 收起功能和两列布局后续再做

## 文件改动清单

| 文件 | 改什么 |
|---|---|
| `Centro.vue` | flex 方向竖→横 |
| `Calendar.vue` | 点击事件 + `selectedDay` + 三态 class + 灰色渐变 |
| `CapsuleShelf.vue` | 从空壳→胶囊列表 |
| `themeVariables.css` | 加灰色渐变变量（亮/暗） |
| `stores/capsule.ts` | 不需要改 |
| `design/color.md` | 已记录灰色渐变规格 |

---

## 1. Centro 布局

**`Centro.vue` `<style scoped>`** — 两处改动：

```css
.container {
  flex-direction: row;           /* column → row */
  align-items: flex-start;       /* center → flex-start（日历靠左上） */
}
```

尺寸不变。`justify-content: center` 保留，让 Calendar + CapsuleShelf 整体水平居中。

---

## 2. 日历高亮三态

### 2a. 新增变量（Calendar.vue `<script setup>`）

```ts
const selectedDay = ref<number | null>(null);
```

### 2b. 点击函数

```ts
function selectDay(day: number) {
  if (day < 1 || day > 当月天数.value) return;       // 只响应当月格子
  selectedDay.value = (selectedDay.value === day) ? null : day;
  
  const formatted = timeManager.getFormatted();
  const month = String(formatted.month + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  capsuleStore.setDate(`${formatted.year}-${month}-${dayStr}`);
}
```

> 需要引入 `useCapsuleStore` → `const capsuleStore = useCapsuleStore()`

### 2c. 模板：当月 Cell 加点击 + 三态 class

```html
<Cell
  v-for="day此月 in 当月天数"
  :key="'curr-' + day此月"
  :blockSize="cellInlineSize + 'dvi'"
  :inlineSize=cellInlineSize
  class="thisMonth"
  :class="{
    today: selectedDay === null && day此月 === 今天几号,
    selected: selectedDay === day此月,
    todayUnselected: selectedDay !== null && selectedDay !== 今天几号 && day此月 === 今天几号
  }"
  @click="selectDay(day此月)"
>
```

三态语义：

| class | 条件 | 外观 |
|---|---|---|
| `today` | 无选中 **且** 是今天 | 蓝色渐变 + 白字 |
| `selected` | 格子是当前选中 | 蓝色渐变 + 白字 |
| `todayUnselected` | 有选中但选的是别的日期 **且** 是今天 | 凹陷灰色（`box-shadow: inset`）+ 白字 |

### 2d. CSS（Calendar.vue `<style scoped>`）

`.selected` 复用 `.today` 的蓝色渐变样式（合并选择器），`.todayUnselected` 用 `box-shadow: inset` 实现"格子沉下去、四周是阴影"的凹陷效果。

```css
.today, .selected {
  background: linear-gradient(
      to bottom,
      var(--calendar-today-bg-start),
      var(--calendar-today-bg-mid),
      var(--calendar-today-bg-end)
  );
  color: var(--calendar-today-text);
}
.today span, .selected span {
  color: var(--calendar-today-text);
}

.todayUnselected {
  background-color: var(--calendar-today-unselected-bg);
  box-shadow: inset 0 0 6px 2px var(--calendar-today-unselected-shadow);
  color: var(--calendar-today-text);
}
.todayUnselected span {
  color: var(--calendar-today-text);
}
```

### 2e. 为什么用 `box-shadow: inset` 而不是渐变

design/color.md 规格："阴影最深 #ADADAD，对数均匀过渡到中间 #CCCCCC，只有一小条深色，深色尾巴覆盖到整个格子"——描述的就是**四边暗、中心亮**的内凹陷效果。`box-shadow: inset` 天然实现这个效果，不需要手动调整停靠点。详见第 3 节颜色变量。

---

## 3. 灰色凹陷效果颜色变量

### 推导（design/color.md 第 15 行）

四边阴影 `#ADADAD`，中心底色 `#CCCCCC`，文字 `#FFFFFF`。

深色模式反转：中心比日历格底稍亮，四边比底暗，保持凹陷感。

| 变量 | 亮色 | 暗色 | 说明 |
|---|---|---|---|
| `--calendar-today-unselected-bg` | `rgb(74 67 67 / 0.2)` | `#0c0e0b` | 格子中心底色（浅于阴影） |
| `--calendar-today-unselected-shadow` | `#3c3838` | `#4c574c` | 四周内阴影色（深于中心） |
| 文字色 | `--calendar-today-text`（`#FFFFFF`） | 同上 | 不变 |

### 追加到 `themeVariables.css`

```css
/* 亮色 :root 末尾 */
--calendar-today-unselected-bg: rgb(74 67 67 / 0.2);
--calendar-today-unselected-shadow: #3c3838;

/* 暗色 [data-theme='dark'] 末尾 */
--calendar-today-unselected-bg: #0c0e0b;
--calendar-today-unselected-shadow: #4c574c;
```

Calendar.vue 里的使用方式见 2d 节——`background-color` + `box-shadow: inset ...`，两个变量。

---

## 4. CapsuleShelf 骨架

### 4a. 引入 store + 监听日期变化

```ts
import { useCapsuleStore } from '@/stores/capsule.ts';
const capsuleStore = useCapsuleStore();

import { watch } from 'vue';
watch(() => capsuleStore.selectedDate, () => {
  capsuleStore.fetchCapsules();
}, { immediate: true });
```

`immediate: true` 让组件挂载时立刻拉取今天的数据。

### 4b. 模板结构

```html
<template>
  <div class="shelf">
    <h2 class="shelf-date">{{ capsuleStore.selectedDate }}</h2>

    <div v-if="capsuleStore.isLoading">加载中...</div>
    <div v-else-if="capsuleStore.error">{{ capsuleStore.error }}</div>
    <p v-else-if="capsuleStore.capsules.length === 0">这一天没有时间胶囊哦。</p>

    <div v-else class="capsule-list">
      <div v-for="item in capsuleStore.capsules" :key="item.id" class="capsule-card">
        <h3>{{ item.title }}</h3>
        <div class="capsule-meta">
          <span v-if="item.startTime">{{ item.startTime }}</span>
          <span class="capsule-status">{{ item.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 4c. 基础样式

```css
.shelf {
  flex: 1;
  padding: 1.5rem;
  color: var(--theme-color);
}
.shelf-date {
  margin-block-end: 1rem;
  font-size: 1.25rem;
}
.capsule-card {
  padding: 0.75rem 1rem;
  margin-block-end: 0.5rem;
  background: var(--calendar-cell-bg);
  border: 1px solid var(--calendar-grid-line);
  border-radius: 4px;
}
.capsule-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--calendar-cell-text-small);
}
.capsule-status {
  color: var(--theme-link);
}
```

---

## 执行顺序

1. `themeVariables.css` — 加灰色凹陷变量 ✅
2. `Calendar.vue` — 点击 + 三态逻辑 + 动画开关 + 伪元素渐变过渡 ✅
3. `Centro.vue` — 改 flex 方向 ✅
4. `Capsule.vue` — 单个胶囊卡片组件 ✅
5. `CapsuleShelf.vue` — 渲染 CapsuleComponent 从 `store.byCreatedAt` ✅

> 实际实现与原计划不同：CapsuleShelf 没有 date watch / loading 四状态，直接渲染全部胶囊。每个胶囊独立管理展开/收起（local `expanded` ref），无需 emit 链。Centro.vue 为纯布局容器。`CalendarBody.vue` 从 Calendar.vue 中提取为独立组件；交互事件通过 `useCalendarAction` composable 向 CapsuleShelf 发送信号。
> 
> 后续重构：CalendarBody.vue 从 Calendar.vue 中提取为独立组件，负责网格渲染和交互事件；Clock.vue 为独立头部组件；Calendar.vue 简化为布局壳（管理 `monthOffset`、渲染 Clock + CalendarBody + tail selects）。交互事件（单击/双击/右键）实现在 CalendarBody 中，通过 composable (`useCalendarAction`) 向 CapsuleShelf 发送信号。

---

## 后续想法

### 字体自定义（partially implemented）

- [x] CSS 变量 `--font-body`，已定义
- [x] Pinia store `stores/font.ts`，`fontBody` 字段，`localStorage` 持久化
- [x] 字体切换 UI 已在 gate-gap 中增加「字」按钮循环切换正文
- [x] 内置字体文件：`frontend/public/SourceHanSansCN-Normal.woff2`
- [ ] 标题字体 `--font-title`、装饰字体 `--font-deco` — 待添加
- [ ] 用户上传自定义字体（IPC + 文件对话框 + userData/fonts/）— 待实现
