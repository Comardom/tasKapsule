import { ref, onMounted , onUnmounted } from 'vue';
import { checkBackendHealth } from "@/utils/backendHealthCheck";

export function loadingPageController() {
    const isBackendReady = ref(false);
    const loadingText = ref('正在准备后端环境...'); // 用于显示进度文字


    // 后端探测逻辑
    onMounted(async () => {
        console.log('[App.vue] 开始探测后端...');

        // 监听来自 Electron 的 JVM 状态更新
        if (window.electronAPI) {
            window.electronAPI.onJvmStatus((status: string) => {
                loadingText.value = status;
            });
        }

        let ready = false;
        while (!ready) {
            try {
                ready = await checkBackendHealth();
            } catch (e) {
                ready = false;
            }
            if (!ready) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
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
        loadingText // 暴露给外部
    };
}