<script setup lang="ts">
import {computed , ref} from "vue";

import "@/globalCSS/baseReset.css"
import '@/globalCSS/baseNiceStyle.css'

import LoadingScreen from "@/components/LoadingScreen.vue";
import TestPage from "@/components/TestPage.vue";
import TestPage1 from "@/components/TestPage1.vue";

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
  currentPage.value = currentPage.value === WhatPage.MainPage
    ? WhatPage.ProfilePage
    : WhatPage.MainPage;
};
</script>

<template>
  <div id="app-all">
    <LoadingScreen v-if="!isBackendReady" :status-text="loadingText" />
    <main v-if="isBackendReady">
      <TestPage v-show="currentPage === WhatPage.MainPage" >
        <button @click="changePage">去{{buttonText}}页</button>
      </TestPage>
      <TestPage1 v-show="currentPage === WhatPage.ProfilePage" >
        <button @click="changePage">去{{buttonText}}页</button>
      </TestPage1>
    </main>
  </div>
</template>