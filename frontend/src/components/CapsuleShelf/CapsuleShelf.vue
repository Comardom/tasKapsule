<script setup lang="ts">

import CapsuleComponent from "@/components/CapsuleShelf/Capsule.vue"
import type { Capsule } from '@/stores/capsule.ts';
import { useCapsuleStore } from '@/stores/capsule.ts';
import {computed, nextTick, onMounted, ref, watch} from "vue";
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



const switchViewMode = async (mode: 'single' | 'double') => {
  // 如果浏览器不支持该 API（比如旧版浏览器），直接无缝降级硬切
  if (!document.startViewTransition) {
    store.setViewMode(mode);
    return;
  }
  /*// 告诉浏览器捕捉当前快照，并在回调里修改状态，触发粒子飞跃
  document.startViewTransition(() => {
    store.setViewMode(mode);
  });*/
  const transition = document.startViewTransition(() => {
    store.setViewMode(mode)
  })
  await transition.finished;
};


const switchDisplayMode = (mode: any) => {
  if (!document.startViewTransition) {
    store.setDisplayMode(mode);
    return;
  }
  document.startViewTransition(() => {
    store.setDisplayMode(mode);
  });
};



const getCapsuleTransitionName = (capsule: Capsule, groupDate: string) => {
  const isLastMode = store.displayMode === 'last';
  // 如果是仅末日模式，锚定结束日期；否则一律锚定开始日期
  const targetDate = isLastMode
      ? (capsule.scheduleEndAt || capsule.scheduleStartAt)?.substring(0, 10)
      : capsule.scheduleStartAt?.substring(0, 10);

  // 只有当当前格子刚好是我们要锚定的那一天时，才赋予飞跃超能力，完美避免影分身冲突
  return groupDate === targetDate ? `capsule-${capsule.id}` : undefined;
};

watch(() => store.selectedDate, async (newDate) => {
  if (store.viewMode !== 'double') {
    await switchViewMode('double');
  }
  await nextTick()
  const timelineCol = document.querySelector('.timeline-column')
  if (!timelineCol) return
  let target = timelineCol.querySelector(`[data-need-to-be-scrolled-date="${newDate}"]`) as HTMLElement | null
  if (!target) {
    const dates = timelineGrouped.value.map(g => g.date)
    const nearest = findNearestDate(newDate, dates)
    if (nearest) {
      target = timelineCol.querySelector(`[data-need-to-be-scrolled-date="${nearest}"]`) as HTMLElement | null
    }
  }
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
function findNearestDate(target: string, dates: string[]): string | null {
  if (dates.length === 0) return null
  const targetMs = new Date(target).getTime()
  let nearest: string | null = null
  let nearestDiff = Infinity
  for (const d of dates) {
    const diff = Math.abs(new Date(d).getTime() - targetMs)
    if (diff < nearestDiff) {
      nearestDiff = diff
      nearest = d
    } else if (diff === nearestDiff && nearest) {
      // 等距取未来日期
      if (new Date(d).getTime() > new Date(nearest).getTime()) {
        nearest = d
      }
    }
  }
  return nearest
}
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
            :data-need-to-be-scrolled-date="group.date"
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



      <div class="gate-gap">
<!--        v-for一堆短竖条然后鼠标hover就张开？但是会影响正常的体验-->
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

.unscheduled-column {
  flex: 1;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1dvb;
}
.unscheduled-column::-webkit-scrollbar {
  display: none;
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
.timeline-group {
  margin-block-end: 1dvb;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.timeline-group .capsule-in {
  align-items: flex-end;
}
.date-header {
  font-size: 0.875rem;
  color: var(--calendar-cell-text-small);
  margin-block-end: 0.25rem;
  padding-inline-start: 0.25rem;
}
</style>