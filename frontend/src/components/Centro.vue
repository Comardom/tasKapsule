<script setup lang="ts">
import Calendar from "@/components/Calendar/Calendar.vue";
import CapsuleShelf from "@/components/CapsuleShelf.vue";
</script>

<template>
  <div class="container">
    <Calendar></Calendar>
    <CapsuleShelf></CapsuleShelf>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  block-size: 100svb;
  inline-size: 100svi;
}
</style>