<script setup lang="ts">
import LoadingScreen from "@/components/LoadingScreen.vue";
import TestPage from "@/components/TestPage.vue";
import '@/globalCSS/baseNiceStyle.css'
import { loadingPageController } from '@/utils/loadingPageController.ts'
const {isBackendReady} = loadingPageController();
</script>

<template>
  <div id="app-all">
    <LoadingScreen v-if="!isBackendReady" />
    <TestPage v-if="isBackendReady" />
  </div>
</template>