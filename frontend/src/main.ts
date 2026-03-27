import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
//控制全局视图的
import '../src/globalCSS/baseReset.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
