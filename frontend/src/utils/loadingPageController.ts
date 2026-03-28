import { ref, onMounted } from 'vue';
import { checkBackendHealth } from "@/utils/backendHealthCheck";

export function loadingPageController() {
    const isBackendReady = ref(false);

    // 后端探测逻辑
    onMounted(async () => {
        console.log('[App.vue] 开始探测后端...');
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

    // 暴露给组件使用
    return {
        isBackendReady
    };
}