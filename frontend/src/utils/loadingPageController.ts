import { ref, onMounted , onUnmounted } from 'vue';
import { checkBackendHealth } from "@/utils/backendHealthCheck";

export function loadingPageController() {
    const isBackendReady = ref(false);
    const loadingText = ref('正在准备后端环境...'); // 用于显示进度文字


    // 后端探测逻辑
    onMounted(async () => {
        console.log('[App.vue] 开始探测后端...');

        // 监听来自 Electron 的 JVM 状态更新，状态每次更新都会触发更新，状态来自electron/preload.ts
        if (window.electronAPI) {
            window.electronAPI.onJvmStatus((status: string) => {
                loadingText.value = status;
            });
        }

        let ready = false;
        let retries = 0;
        const MAX_RETRIES = 120;
        while (!ready && retries < MAX_RETRIES) {
            ready = await checkBackendHealth();
            if (!ready) {
                retries++;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (!ready) {
            loadingText.value = '后端启动超时，请检查 Java 环境或重启应用';
            return;  // 不设 isBackendReady = true，加载页永远显示错误信息
        }
        console.log('[App.vue] 后端已就绪。');
        isBackendReady.value = true;
    });

    onUnmounted(() => {
        // 组件销毁时移除监听
        if (window.electronAPI) {
            window.electronAPI.removeJvmListeners();
        }
    });

    // 暴露给组件使用
    return {
        isBackendReady,
        loadingText
    };
}