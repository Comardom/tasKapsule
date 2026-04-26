<script setup lang="ts">
import {computed} from "vue";

interface Props {
  inlineSize?: string | number
  blockSize?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  inlineSize: '100%',
  blockSize: '100%'
})

// 处理传进来的宽高，数字自动加dvw，字符串直接用
const blockStyle = computed(() => ({
  'block-size': typeof props.blockSize === 'number' ? `${props.blockSize}dvb` : props.blockSize,
  'inline-size': typeof props.inlineSize === 'number' ? `${props.inlineSize}dvi` : props.inlineSize
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
  border: var(--theme-color) 1px solid;
}
</style>