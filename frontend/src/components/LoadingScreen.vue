<script setup lang="ts">
defineProps<{
  statusText: string
}>();
import LoadingRectangle from "./LoadingRectangle.vue";
import "../globalCSS/baseReset.css"
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 撑满屏幕高度 */
}
</style>