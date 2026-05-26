# 日历格子交互改造

## 概述

统一左键单击 / 左键双击 / 右键单击三种操作，替换当前单一点击逻辑。

## 交互映射

| 操作 | 行为 |
|---|---|
| **左键单击** | 只设 `selectedDate`，不切模式、不滚动（纯展示） |
| **左键双击** | 切双列 + 滚动到该日期（同当前的 `cellClicked`） |
| **右键单击** | 阻止菜单 → 打开新建 modal，预填该日期 |

## 双击防抖

浏览器 `dblclick` 会触发两次 `click`。方案：

```
第一次 click → 设 250ms 定时器
250ms 内又来一次 click → 识别为双击，取消定时器，执行双击逻辑
定时器到期 → 执行单击逻辑（只设 selectedDate）
```

```html
<!-- Cell 上绑定 -->
@click="handleClick(day, isOtherMonth)"
@dblclick="handleDblClick(day, isOtherMonth)"
@contextmenu.prevent="handleRightClick(day, isOtherMonth)"
```

```ts
let clickTimer: ReturnType<typeof setTimeout> | null = null

function handleClick(day: number, isOtherMonth: boolean) {
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
    // 第二次点击 → 忽略，由 dblclick 处理
    return
  }
  clickTimer = setTimeout(() => {
    clickTimer = null
    singleClick(day, isOtherMonth)  // 只设 selectedDate
  }, 250)
}

function handleDblClick(day: number, isOtherMonth: boolean) {
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
  }
  doubleClick(day, isOtherMonth)  // 切双列 + 滚动
}
```

## 右键新建 → Modal 数据流

```
Calendar 右键单击
  ↓
targetDate 计算（同现有 cellClicked 的日期逻辑）
  ↓
capsuleStore.pendingCreateDate = "YYYY-MM-DD"
  ↓
CapsuleShelf watch(() => store.pendingCreateDate)
  → showCreateModal = true
  ↓
CreateCapsuleModal 接收 prop preselectedDate
  → 自动勾选「有日程」
  → scheduleStartAt 预填 "YYYY-MM-DDT00:00"
  → scheduleEndAt   预填 "YYYY-MM-DDT23:59"
  → 用户可修改日期
  ↓
提交后清空 store.pendingCreateDate
```

### 新增 store 字段

```ts
// stores/capsule.ts
state: () => ({
  ...
  pendingCreateDate: '' as string,
})
```

### Modal prop

```ts
// CreateCapsuleModal.vue
const props = defineProps<{
  preselectedDate?: string
}>()

onMounted(() => {
  if (props.preselectedDate) {
    isWithSchedule.value = true
    scheduleStartAt.value = props.preselectedDate + 'T00:00'
    scheduleEndAt.value = props.preselectedDate + 'T23:59'
  }
})
```

## 不涉及改动

- 其他月格子的交互不变（也走新的 click/dblclick/rightclick）
- Calendar 的 `cellClicked` 函数拆为三个：`singleClick` / `doubleClick` / `rightClick`
- 现有 `switchViewMode` 动画不变
- CapsuleShelf 的 `watch(selectedDate)` 只响应双击和手动切换，单击不触发
