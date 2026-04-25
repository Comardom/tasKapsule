<script setup lang="ts">
defineProps<{
  statusText: string
}>();
import LoadingRectangle from "./LoadingRectangle.vue";
import "../globalCSS/baseReset.css"
import '@/globalCSS/themeVariables.css'
import "../globalCSS/baseNiceStyle.css"
</script>
<template>
  <div class="loading-wrapper">
    <LoadingRectangle />
    <p class="status-msg">{{ statusText }}</p>
  </div>
</template>

<style scoped>
.loading-wrapper {
  /*display: flex;*/
  display: grid;
  place-content: center;
  place-items: center;
  /*flex-direction: column;
  justify-content: center;
  align-items: center;*/
  /* 撑满屏幕高度，使用 dvb */
  block-size: 100dvb;
  inline-size: 100%;
  /* gap替代子元素的 margin */
  gap: 1.5rem;
}
.status-msg {
  margin: 0; /* 清除默认间距 */
}
</style>