<script setup lang="ts">
import { computed } from 'vue'
import { animationTypes, type AnimationDirection, type AnimationPlugin } from './calendarAnimations'

interface Props {
  type?: string
  direction?: AnimationDirection
}
const props = withDefaults(defineProps<Props>(), {
  type: 'slide-vertical',
  direction: 1,
})

const emit = defineEmits<{ wheel: [e: WheelEvent] }>()

const def = animationTypes['slide-vertical']!
const plugin = computed(() => (animationTypes[props.type] ?? def) as AnimationPlugin)

function beforeLeave(el: Element) {
  const e = el as HTMLElement
  const w = e.closest('.calendar-body-wrapper') as HTMLElement
  if (w) w.style.blockSize = `${w.offsetHeight}px`
  e.style.position = 'absolute'
  e.style.width = '100%'
}

function leave(el: Element, done: () => void) {
  plugin.value.leave(el, done, props.direction)
}

function enter(el: Element, done: () => void) {
  plugin.value.enter(el, done, props.direction)
}

function afterEnter(el: Element) {
  const e = el as HTMLElement
  e.style.position = ''
  const w = e.closest('.calendar-body-wrapper') as HTMLElement
  if (w) w.style.blockSize = ''
}
</script>

<template>
  <div class="calendar-body-wrapper" @wheel.prevent="emit('wheel', $event)">
    <Transition
      mode="out-in"
      @before-leave="beforeLeave"
      @leave="leave"
      @enter="enter"
      @after-enter="afterEnter"
    >
      <slot />
    </Transition>
  </div>
</template>

<style scoped>
.calendar-body-wrapper {
  position: relative;
  overflow: hidden;
  inline-size: var(--full-inline-size);
}
</style>
