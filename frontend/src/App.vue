<script setup lang="ts">
import {computed , ref} from "vue";

import "@/globalCSS/baseReset.css"
import '@/globalCSS/themeVariables.css'
import '@/globalCSS/baseNiceStyle.css'

import { useThemeStore } from "@/stores/theme.ts";
const themeStore = useThemeStore();

import LoadingScreen from "@/components/LoadingScreen.vue";
import TestPage from "@/components/TestPage.vue";
import TestPage1 from "@/components/TestPage1.vue";
import TestPinia from "@/components/TestPinia.vue";

import { loadingPageController } from '@/utils/loadingPageController.ts'
const {isBackendReady, loadingText} = loadingPageController();

enum WhatPage {
  MainPage,
  ProfilePage
}
const currentPage = ref<WhatPage>(WhatPage.MainPage);
const buttonText = computed(() => {
  return currentPage.value === WhatPage.MainPage ? '个人' : '主';
});
const changePage = () => {
  currentPage.value =
      currentPage.value === WhatPage.MainPage
          ? WhatPage.ProfilePage
          : WhatPage.MainPage;
};
</script>

<template>
  <div id="app-all">
    <LoadingScreen v-if="!isBackendReady" :status-text="loadingText" />
    <main v-if="isBackendReady">
      <TestPage v-show="currentPage === WhatPage.MainPage" >
        <button @click="changePage">
          当前是{{WhatPage[currentPage]}}, 去{{buttonText}}页
        </button>
        <button @click="themeStore.toggleTheme" class="theme-btn">
          {{ themeStore.theme === 'dark' ? '🌙 暗色模式' : '🌞 亮色模式' }}
        </button>
      </TestPage>
<!--      <TestPage1 v-show="currentPage === WhatPage.ProfilePage" >
        <button @click="changePage">
          当前是{{WhatPage[currentPage]}}, 去{{buttonText}}页
        </button>
        <button @click="themeStore.toggleTheme" class="theme-btn">
          {{ themeStore.theme === 'dark' ? '🌙 暗色模式' : '🌞 亮色模式' }}
        </button>
      </TestPage1>-->
      <TestPinia v-show="currentPage === WhatPage.ProfilePage" ></TestPinia>
    </main>
  </div>
</template>