import { createApp  } from 'vue'
import { createPinia } from 'pinia'
import router from "@/router";

import App from './App.vue'
//控制全局视图
import '@/globalCSS/baseReset.css'
import '@/globalCSS/themeVariables.css'
import '@/globalCSS/baseNiceStyle.css'


console.log('--- [Main.ts] 脚本开始加载 ---');


const app = createApp(App);
app.use(createPinia());
app.use(router);


// 使用 IIFE 立即执行异步初始化逻辑
;(async () => {
  try {
    console.log('--- [IIFE] 应用启动初始化 ---');
    // 这里我们将暂时注释掉 healthCheck，因为我们要把它移到 App.vue 里去控制 UX
    // await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟后端启动 2s

    // 3. 立即挂载 Vue！让用户先看到前端界面
    app.mount('#app')
    console.log('--- [IIFE] Vue 已挂载 ---');

  } catch (error) {
    console.error('应用初始化严重错误:', error);
  }
})();