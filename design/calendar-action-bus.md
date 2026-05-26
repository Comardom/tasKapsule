# Calendar Action Bus

## 问题

日历点击（双击/右键）需要把"导航到日期"和"打开创建弹窗"两个信号传给 CapsuleShelf，但 Calendar 和 CapsuleShelf 是 Centrolayout 中的同级兄弟组件，没有直接的 props 通道。

## 方案：module-level composable（事件总线）

不用 `provide/inject`，不用修改 Pinia store，而是用一个模块级（module-level）ref 的 composable 做轻量级事件总线。

### 文件位置

```
frontend/src/composables/useCalendarAction.ts
```

### 原理

Vue composable 如果 ref 定义在模块顶层（不在 `useXxx()` 函数内部），则所有调用者共享同一个 ref 实例。效果类似全局单例，但类型安全、零依赖。

```ts
import { ref } from 'vue'

const pendingCreateDate = ref('')
const navigateToDate = ref('')

export function useCalendarAction() {
  function setPendingCreateDate(date: string) { pendingCreateDate.value = date }
  function setNavigateToDate(date: string) { navigateToDate.value = date }

  return {
    pendingCreateDate,
    navigateToDate,
    setPendingCreateDate,
    setNavigateToDate,
  }
}
```

### 谁用

| 组件 | 读/写 | 字段 |
|---|---|---|
| Calendar.vue | 写 | `setNavigateToDate`（双击）、`setPendingCreateDate`（右键） |
| CapsuleShelf.vue | 读+写 | `navigateToDate` watch → 切换双栏+滚动后清空；`pendingCreateDate` watch → 打开弹窗后清空 |
| CreateCapsuleModal.vue | 不直接引用 | `preselectedDate` 由 CapsuleShelf 作为 prop 传入 |

### 数据流

```
Calendar 双击
  → setNavigateToDate('2026-05-20')
  → CapsuleShelf watcher 检测到 navigateToDate 非空
  → switchViewMode('double') + scroll
  → navigateToDate = '' (清空)

Calendar 右键
  → setPendingCreateDate('2026-05-20')
  → CapsuleShelf watcher 检测到 pendingCreateDate 非空
  → showCreateModal = true + 传入 :preselectedDate
  → 弹窗关闭 → onCloseModal() → pendingCreateDate = '' (清空)
```

### 为什么不用其他方案

| 方案 | 缺点 |
|---|---|
| 改 Pinia store | 把 UI 状态混入数据 store，职责不清 |
| provide/inject | Centrolayout 需要中转，增加中间层责任 |
| EventBus (mitt) | 不如 composable 类型安全，需要手动 on/off |
| 直接把 Calendar 和 CapsuleShelf 塞进同一组件 | 组件职责耦合 |

### 边界情况

- **快速重复右键**：`pendingCreateDate` 被覆盖为新值，watcher 再次触发 → modal 已有则 Vue 会复用/重建（`v-if`） → 新增选框内容丢失 → 可接受，右键本来就不该快速点
- **双击后手动切回单栏再点日历**：`navigateToDate` watch 每次都是干净的状态，不会残留
- **component unmount**：composable 的 ref 是 module-level，不会随组件销毁而重置 → 但 Calendar 和 CapsuleShelf 都是常驻组件，不卸载，所以没问题
