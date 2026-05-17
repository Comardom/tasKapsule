<script setup lang="ts">
import Calendar from "@/components/Calendar/Calendar.vue";
import CapsuleShelf from "@/components/CapsuleShelf/CapsuleShelf.vue";
import Placeholder from "@/components/Placeholder.vue";
</script>

<template>
  <div class="container">
    <Placeholder />
    <Calendar />
    <CapsuleShelf
        :style="{ flex: 1 }"
    />
    <Placeholder />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  block-size: 100svb;
  inline-size: 100svi;
}
</style>