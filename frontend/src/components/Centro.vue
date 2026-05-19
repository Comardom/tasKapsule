<script setup lang="ts">
import Calendar from "@/components/Calendar/Calendar.vue";
import CapsuleShelf from "@/components/CapsuleShelf/CapsuleShelf.vue";
import Placeholder from "@/components/Placeholder.vue";
</script>

<template>
  <div class="container">
    <Placeholder
        height='100svb'
        width="1.5rem"
    />
    <Calendar />
    <Placeholder
        v-for="i in 5"
        height='100svb'
        width="1.5rem"
    />
    <CapsuleShelf
        :style="{ flex: 1 }"
    />
    <Placeholder
        height='100svb'
        width="1.5rem"
    />
  </div>
</template>

<style scoped>
.container {
  /*background-image: url('/WW_win95_v004_dark_wide_post.png');*/
  background-size: cover;     /* 关键：覆盖整个容器，保持比例裁切 */
  background-position: center; /* 关键：图片居中显示 */
  background-repeat: no-repeat; /* 防止重复平铺 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  block-size: 100svb;
  inline-size: 100svi;
}
</style>