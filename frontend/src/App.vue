<script setup lang="ts">
import LoadingScreen from "@/components/LoadingScreen.vue";
import TestPage from "@/components/TestPage.vue";
import '@/globalCSS/baseNiceStyle.css'
import { loadingPageController } from '@/utils/loadingPageController.ts'
const {isBackendReady, loadingText} = loadingPageController();
</script>

<template>
  <div id="app-all">
    <LoadingScreen v-if="!isBackendReady" :status-text="loadingText" />
    <TestPage v-if="isBackendReady" />
  </div>
</template>