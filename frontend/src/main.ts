import { createApp  } from 'vue'
import { createPinia } from 'pinia'
import router from "@/router";

import App from './App.vue'
//控制全局视图
import '@/globalCSS/baseReset.css'
import '@/globalCSS/themeVariables.css'
import '@/globalCSS/baseNiceStyle.css'
import '@/globalCSS/fonts.css'


console.log('--- [Main.ts] 脚本开始加载 ---');


const app = createApp(App);
app.use(createPinia());
app.use(router);

app.mount('#app');