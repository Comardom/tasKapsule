<script setup lang="ts">
import router from "@/router";

import { useThemeStore } from "@/stores/theme.ts";
const themeStore = useThemeStore();

import LoadingScreen from "@/components/LoadingScreen.vue";

import { loadingPageController } from '@/utils/loadingPageController.ts'
const {isBackendReady, loadingText} = loadingPageController();

function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div id="app-all">
    <LoadingScreen v-if="!isBackendReady" :status-text="loadingText" />
    <main v-if="isBackendReady">
      <nav class="global-nav" style="position: absolute;"><!--测试用的切换顶栏-->
<!--        注意这里的按钮文字不同会导致按钮高度不同、位置不同，不要中英混用-->
        <button @click="goTo('/')">Centro</button>
        <button @click="goTo('/test')">主页</button>
        <button @click="goTo('/test1')">个人</button>
        <button @click="goTo('/test-pinia')">TestPinia</button>
        <button @click="goTo('/ego-me')">EgoMe</button>
        <button @click="themeStore.toggleTheme">
          {{ themeStore.theme === 'dark' ? '🌙 暗色模式' : '🌞 亮色模式' }}
        </button>
      </nav>
      <router-view /><!--根据当前 URL 自动渲染对应页面组件-->
    </main>
  </div>
</template>