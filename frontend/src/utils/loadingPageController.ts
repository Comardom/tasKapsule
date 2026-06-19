import { ref, onMounted } from 'vue'
import { capsuleApi } from '@/utils/apiService.ts'

const POLL_INTERVAL = 500
const MAX_RETRIES = 10

export function loadingPageController() {
  const isBackendReady = ref(false)
  const loadingText = ref('加载中...')
  let retries = 0

  const poll = async () => {
    try {
      await capsuleApi.getAllPaginated(1, 1)
      isBackendReady.value = true
    } catch {
      retries++
      if (retries < MAX_RETRIES) {
        setTimeout(poll, POLL_INTERVAL)
      } else {
        loadingText.value = '后端启动失败，请重启应用'
      }
    }
  }

  onMounted(() => {
    setTimeout(poll, 300)
  })

  return { isBackendReady, loadingText }
}