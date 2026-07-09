<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Placeholder from "@/components/Placeholder.vue";

interface Props {
  displayYear: number;
  displayMonth: number;
}
const props = withDefaults(defineProps<Props>(), {

});

const realNow = ref('')
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  function update() {
    const d = new Date()
    const y = d.getFullYear()
    const M = String(d.getMonth() + 1).padStart(2, '0')
    const D = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    const s = String(d.getSeconds()).padStart(2, '0')
    // 使用ISO表示法
    realNow.value = `${y}-${M}-${D} ${h}:${m}:${s}`
  }
  update()
  timer = setInterval(update, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="calendar-header">
    <span class="month-label">{{ displayYear }}.{{ displayMonth + 1 }}</span>
    <placeholder width="1dvi" h="1dvb" />
<!--    单击回到今天，先向上层发射信号，Calendar接收信号以后操作其他组件-->
    <span
        class="real-time"
        @click="$emit('clickedToToday')"
    >
      {{ realNow }}
    </span>
  </div>
</template>

<style scoped>
.calendar-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  block-size: 4dvi;
  inline-size: 35dvi;
  backdrop-filter: var(--cell-backdrop-filter);
  border: var(--cell-border);
  background: var(--cell-bg);
  box-shadow: var(--cell-box-shadow);
  padding-inline: 0.5rem;
}
.month-label {
  font-weight: 600;
  font-size: 1rem;
}
.real-time {
  font-size: 0.75rem;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}
</style>