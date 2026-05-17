<script setup lang="ts">

</script>

<template>
  <div class="placeholder"></div>
</template>

<style scoped>
.placeholder{
  --full-block-size : 100dvb;
  --full-inline-size : 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /*这个是高度*/
  block-size: var(--full-block-size);
  /*这个是宽度*/
  inline-size: var(--full-inline-size);
}
</style>