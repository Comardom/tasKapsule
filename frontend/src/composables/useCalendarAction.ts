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
