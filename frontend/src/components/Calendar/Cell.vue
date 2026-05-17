<script setup lang="ts">
import {computed} from "vue";

interface Props {
  inlineSize?: string | number
  blockSize?: string | number
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  inlineSize: '100%',
  blockSize: '100%',
  interactive: true
})

// 处理传进来的宽高，数字自动加dvx，字符串直接用；光标控制
const blockStyle = computed(() => ({
  'block-size': typeof props.blockSize === 'number' ? `${props.blockSize}dvb` : props.blockSize,
  'inline-size': typeof props.inlineSize === 'number' ? `${props.inlineSize}dvi` : props.inlineSize,
  'cursor': props.interactive ? 'pointer' : 'default'
}))
</script>

<template>
  <div class="flex-block" :style="blockStyle">
    <slot />
  </div>
</template>

<style scoped>
.flex-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;

  /* === 玻璃效果三大核心 === */

  /* 1. 半透明渐变 */
  backdrop-filter: blur(0.75rem);
  /* 2. 背景模糊 */
  border: 0.125rem solid rgba(255, 255, 255, 0.1);
  /* 3. 边缘高光 */
  background: linear-gradient(180deg, rgba(255,255,255,0.04), transparent);
  /* 立体感增强 */
  box-shadow:0 0.75rem 0.9rem rgba(0, 0, 0, 0.25);
}
.flex-block slot{
  user-select: none;
  -webkit-user-select: none;  /* Safari */
  -moz-user-select: none;     /* Firefox */
  -ms-user-select: none;      /* IE/Edge */
}
/* 文字在渐变层上方，确保选中格子中的文字可见 */
.flex-block > * {
  position: relative;
  z-index: 1;
}
</style>