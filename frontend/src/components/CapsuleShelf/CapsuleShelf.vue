<script setup lang="ts">

import CapsuleComponent from "@/components/CapsuleShelf/Capsule.vue"
import type { Capsule } from '@/stores/capsule.ts';
import { useCapsuleStore } from '@/stores/capsule.ts';
import {computed, onMounted, ref} from "vue";
import CreateCapsuleModal from "@/components/CapsuleShelf/CreateCapsuleModal.vue";


const showCreateModal = ref(false);

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

// 🌟【核心修改点 1】视图切换的点火开关
const switchViewMode = (mode: 'single' | 'double') => {
  // 如果浏览器不支持该 API（比如旧版浏览器），直接无缝降级硬切
  if (!document.startViewTransition) {
    store.setViewMode(mode);
    return;
  }
  // 告诉浏览器捕捉当前快照，并在回调里修改状态，触发粒子飞跃
  document.startViewTransition(() => {
    store.setViewMode(mode);
  });
};

// 🌟【核心修改点 2】过滤模式切换的点火开关（让双列切换显示模式时，胶囊也能飞）
const switchDisplayMode = (mode: any) => {
  if (!document.startViewTransition) {
    store.setDisplayMode(mode);
    return;
  }
  document.startViewTransition(() => {
    store.setDisplayMode(mode);
  });
};

// 🌟【新思路 1】智能动态身份证配对函数
const getCapsuleTransitionName = (capsule: Capsule, groupDate: string) => {
  const isLastMode = store.displayMode === 'last';
  // 如果是仅末日模式，锚定结束日期；否则一律锚定开始日期
  const targetDate = isLastMode
    ? (capsule.scheduleEndAt || capsule.scheduleStartAt)?.substring(0, 10)
    : capsule.scheduleStartAt?.substring(0, 10);

  // 只有当当前格子刚好是我们要锚定的那一天时，才赋予飞跃超能力，完美避免影分身冲突
  return groupDate === targetDate ? `capsule-${capsule.id}` : 'none';
};
</script>

<template>
  <div class="capsule-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button
          :class="{ active: store.viewMode === 'single' }"
          @click="switchViewMode('single')"
      >单列</button>
      <button
          :class="{ active: store.viewMode === 'double' }"
          @click="switchViewMode('double')"
      >双列</button>
      <select
          v-if="store.viewMode === 'double'"
          :value="store.displayMode"
          @change="switchDisplayMode(($event.target as HTMLSelectElement).value as any)"
      >
        <option v-for="opt in displayModeOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <button @click="showCreateModal = true">+ 新建</button>
    </div>
    <!-- 单列模式 -->
    <div v-show="store.viewMode === 'single'" class="single-shelf capsule-in">
      <CapsuleComponent
          v-for="item in store.byCreatedAt"
          :key="item.id"
          :capsule="item"
          :style="{ viewTransitionName: `capsule-${item.id}` }"
      />
    </div>
    <!-- 双列模式 -->
    <div v-show="store.viewMode === 'double'" class="double-shelf">
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
                :style="{ viewTransitionName: getCapsuleTransitionName(item.capsule, group.date) }"
            />
          </div>
        </div>
      </div>
      <div class="unscheduled-column capsule-in">
        <CapsuleComponent
            v-for="item in store.withoutSchedule"
            :key="item.id"
            :capsule="item"
            :style="{ viewTransitionName: `capsule-${item.id}` }"
        />
      </div>
    </div>
  </div>
  <CreateCapsuleModal v-if="showCreateModal" @close="showCreateModal = false" />
</template>

<!-- ── 🌟 1. 全局轻量转场区（去掉 scoped） ── -->
<style>
/* 核心抗闪烁底座：锁死全屏 root 强刷 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none !important;
  mix-blend-mode: normal !important;
}

/* 针对全屏大范围位移特调的“长途慢车”节奏 */
::view-transition-group(*) {
  animation-duration: 0.52s;                 /* 稳稳拉长到 0.52 秒，让大范围飞跃有充足的时间平稳过渡 */
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); /* 顶级 Expo 减速曲线：前半段快速响应，后半段极其丝滑、漫长地减速定格 */
}
</style>


<!-- ── 🌟 2. 组件私有布局区（保留 scoped） ── -->
<style scoped>
/* ── 工具栏定身符 ── */
.toolbar {
  /* 稳固顶部工具栏，防止它参与任何淡入淡出 */
  view-transition-name: shelf-toolbar;
}



.single-shelf, .double-shelf {
  contain: layout style;
}
/* ── 容器 ── */
.capsule-container {
  will-change: transform, opacity;
  display: flex;
  flex-direction: column;
  block-size: 100%;
  inline-size: calc(62dvi - 7.5rem);
  flex: 1;
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