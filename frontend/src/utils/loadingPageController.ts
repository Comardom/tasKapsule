import { ref, onMounted } from 'vue'

export function loadingPageController() {
    const isBackendReady = ref(false)
    const loadingText = ref('加载中...')

    onMounted(async () => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        isBackendReady.value = true
    })

    return { isBackendReady, loadingText }
}