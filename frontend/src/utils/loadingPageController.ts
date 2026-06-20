import { ref, onMounted } from 'vue';
import { checkBackendHealth } from "@/utils/backendHealthCheck";

export function loadingPageController() {
    const isBackendReady = ref(false);
    const loadingText = ref('正在准备后端环境...'); // 用于显示进度文字


    // 后端探测逻辑
    onMounted(async () => {
        console.log('[App.vue] 开始探测后端...');


        let ready = false;
        let retries = 0;
        const MAX_RETRIES  = 10;
        while (!ready && retries < MAX_RETRIES) {
            loadingText.value = `连接后端中... (${retries}/${MAX_RETRIES})`
            ready = await checkBackendHealth();
            if (!ready) {
                retries++;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (!ready) {
            loadingText.value = '后端启动超时，请检查后端或重启应用';
            return;  // 不设 isBackendReady = true，加载页永远显示错误信息
        }
        console.log('[App.vue] 后端已就绪。');
        isBackendReady.value = true;
    });


    // 暴露给组件使用
    return {
        isBackendReady,
        loadingText
    };
}