<script setup lang="ts">

import CapsuleComponent from "@/components/CapsuleShelf/Capsule.vue"
import type { Capsule } from '@/stores/capsule.ts';
import { useCapsuleStore } from '@/stores/capsule.ts';
import {computed, onMounted} from "vue";


const store = useCapsuleStore();
onMounted(() => {
  store.fetchCapsules();
});

const props = defineProps<{
  selectedCapsule?: Capsule | null;
}>();

const displayModeOptions = [
  { value: 'all', label: '全部日期' },
  { value: 'first-last', label: '首尾日期' },
  { value: 'first', label: '仅首日' },
  { value: 'last', label: '仅末日' },
] as const;

const timelineGrouped = computed(() => {
  const groups: { date: string; items: { capsule: Capsule }[] }[] = [];
  for (const entry of store.scheduleTimeline) {
    const last = groups[groups.length - 1];
    if (last && last.date === entry.date) {
      last.items.push({ capsule: entry.capsule });
    } else {
      groups.push({ date: entry.date, items: [{ capsule: entry.capsule }] });
    }
  }
  return groups;
});
</script>

<template>
  <div class="capsule-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button
          :class="{ active: store.viewMode === 'single' }"
          @click="store.setViewMode('single')"
      >单列</button>
      <button
          :class="{ active: store.viewMode === 'double' }"
          @click="store.setViewMode('double')"
      >双列</button>
      <select
          v-if="store.viewMode === 'double'"
          :value="store.displayMode"
          @change="store.setDisplayMode(($event.target as HTMLSelectElement).value as any)"
      >
        <option v-for="opt in displayModeOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>
    <!-- 单列模式 -->
    <div v-if="store.viewMode === 'single'" class="single-shelf capsule-in">
      <CapsuleComponent
          v-for="item in store.byCreatedAt"
          :key="item.id"
          :capsule="item"
      />
    </div>
    <!-- 双列模式 -->
    <div v-else class="double-shelf">
      <div class="timeline-column">
        <div
            v-for="group in timelineGrouped"
            :key="group.date"
            class="timeline-group"
        >
          <div class="date-header"><span>{{ group.date }}</span></div>
          <div class="capsule-in">
            <CapsuleComponent
                v-for="(item, i) in group.items"
                :key="`${group.date}-${item.capsule.id}-${i}`"
                :capsule="item.capsule"
                :showSchedule="true"
            />
          </div>
        </div>
      </div>
      <div class="unscheduled-column capsule-in">
        <CapsuleComponent
            v-for="item in store.withoutSchedule"
            :key="item.id"
            :capsule="item"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── 容器 ── */
.capsule-container {
  display: flex;
  flex-direction: column;
  block-size: 100svb;
  /*background-color: var(--capsule-shelf-bg);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);*/
}
.toolbar button {
  cursor: pointer;
}
.toolbar button.active {
  background: var(--theme-link);
  color: #fff;
}
.capsule-in {
  display: flex;
  flex-direction: column;
  gap: 1dvb;
  block-size: 100%;
}
/* ── 单列 ── */
.single-shelf {
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  align-items: flex-end;
}
.single-shelf::-webkit-scrollbar {
  display: none;
}
/* ── 双列 ── */
.double-shelf {
  display: flex;
  flex-direction: row;
  gap: 1dvi;
  block-size: 100%;
  overflow: hidden;
}
.timeline-column {
  flex: 1;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.timeline-column::-webkit-scrollbar {
  display: none;
}
.unscheduled-column {
  flex: 1;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1dvb;
}
.unscheduled-column::-webkit-scrollbar {
  display: none;
}
.timeline-group {
  margin-block-end: 1dvb;

}
.date-header {
  font-size: 0.875rem;
  color: var(--calendar-cell-text-small);
  margin-block-end: 0.25rem;
  padding-inline-start: 0.25rem;
}
</style>