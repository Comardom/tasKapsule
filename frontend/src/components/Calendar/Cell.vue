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
  border: var(--calendar-grid-line) 1px solid;
  position: relative;
  transition: background-color var(--cell-transition-duration, 0.25s) ease,
              box-shadow var(--cell-transition-duration, 0.25s) ease;
  overflow: hidden;
}
/* 蓝色渐变层，始终存在但默认透明，通过 opacity 过渡实现切换动画 */
.flex-block::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
      to bottom,
      var(--calendar-today-bg-start),
      var(--calendar-today-bg-mid),
      var(--calendar-today-bg-end)
  );
  opacity: 0;
  transition: opacity var(--cell-transition-duration, 0.25s) ease;
  z-index: 0;
}
/* 文字在渐变层上方，确保选中格子中的文字可见 */
.flex-block > * {
  position: relative;
  z-index: 1;
}
</style>