<script setup lang="ts">
import Calendar from "@/components/Calendar/Calendar.vue";
import CapsuleShelf from "@/components/CapsuleShelf/CapsuleShelf.vue";
</script>

<template>
  <div class="container">
    <Calendar></Calendar>
    <Calendar></Calendar>
    <CapsuleShelf></CapsuleShelf>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  /*flex-direction: column;*/
  justify-content: space-between; ;
  align-items: center;
  block-size: 100svb;
  inline-size: 100svi;
}
</style>