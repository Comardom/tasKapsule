import { ref } from 'vue'

// ── module-level ref（模块顶层变量） ──
// ref 定义在 useXxx() 函数外面，所有调用者共享同一组实例。
// Calendar.vue 写、CapsuleShelf.vue 读+清空，构成轻量级事件总线。

// 右键日历选中的日期，驱动 CapsuleShelf 打开创建弹窗并预填
const pendingCreateDate = ref('')
// 双击日历选中的日期，驱动 CapsuleShelf 切换到双栏并滚动到该日期
const navigateToDate = ref('')

export function useCalendarAction() {
  // 设置右键选中日期（Calendar 右键调用 → CapsuleShelf watch 打开弹窗）
  function setPendingCreateDate(date: string) { pendingCreateDate.value = date }
  // 设置导航目标日期（Calendar 双击调用 → CapsuleShelf watch 切换双栏+滚动）
  function setNavigateToDate(date: string) { navigateToDate.value = date }

  return {
    pendingCreateDate,
    navigateToDate,
    setPendingCreateDate,
    setNavigateToDate,
  }
}
