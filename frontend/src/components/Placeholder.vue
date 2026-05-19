<script setup lang="ts">
interface Props {
  width?: string;   // 如: "100px", "50%", "10rem", "100dvi"
  height?: string;  // 如: "200px", "100dvb", "50vh"
}

const props = withDefaults(defineProps<Props>(), {
  width: '1.5rem',
  height: '100dvb'
});
</script>

<template>
  <div
      class="placeholder"
      :style="{
      inlineSize: props.width,
      blockSize: props.height
    }"
  ></div>
</template>

<style scoped>
.placeholder{
  /*--full-block-size : 100dvb;
  --full-inline-size : 1.5rem;*/
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /*!*这个是高度*!
  block-size: var(--full-block-size);
  !*这个是宽度*!
  inline-size: var(--full-inline-size);*/
}
</style>