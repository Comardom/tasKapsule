<script setup lang="ts">
import type { Capsule } from '@/stores/capsule.ts';

defineProps<{
  capsule: Capsule;
}>();
</script>

<template>
  <div class="capsule-card">
    <h3 class="capsule-title">{{ capsule.title }}</h3>
    <div class="capsule-meta">
      <span v-if="capsule.startTime" class="capsule-time">{{ capsule.startTime }}</span>
      <span class="capsule-status" :class="{ completed: capsule.status === 'COMPLETED' }">
        {{ capsule.status === 'COMPLETED' ? '已完成' : '待完成' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.capsule-card {
  padding: 0.75rem 1rem;
  margin-block-end: 0.5rem;
  background-color: var(--calendar-cell-bg);
  border: 1px solid var(--calendar-grid-line);
  border-radius: 4px;
  transition: box-shadow 0.2s ease;
}
.capsule-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.capsule-title {
  margin: 0 0 0.375rem 0;
  font-size: 1rem;
  color: var(--calendar-cell-text);
}
.capsule-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.875rem;
}
.capsule-time {
  color: var(--calendar-cell-text-small);
}
.capsule-status {
  color: var(--calendar-today-bg-mid);
}
.capsule-status.completed {
  color: var(--calendar-cell-text-small);
}
</style>
