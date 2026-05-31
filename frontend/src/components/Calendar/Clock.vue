<script setup lang="ts">

interface Props {
  displayYear: number;
  displayMonth: number;
}
const props = withDefaults(defineProps<Props>(), {

});
</script>

<template>
  <div class="calendar-header">
    <span>{{ displayYear }} {{ displayMonth + 1 }} </span>
  </div>
</template>

<style scoped>
.calendar-header span {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;


  block-size: 7dvb;
  inline-size: 35dvi;
  backdrop-filter: var(--cell-backdrop-filter);
  border:var(--cell-border);
  background: var(--cell-bg);
  box-shadow:var(--cell-box-shadow);
}
</style>