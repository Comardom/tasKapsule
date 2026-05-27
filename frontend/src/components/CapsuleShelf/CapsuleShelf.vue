<script setup lang="ts">

import CapsuleComponent from "@/components/CapsuleShelf/Capsule.vue"
import type {Capsule, DisplayMode} from '@/stores/capsule.ts';
import { useCapsuleStore } from '@/stores/capsule.ts';
import { useCalendarAction } from '@/composables/useCalendarAction';
import {computed, nextTick, onMounted, ref, watch} from "vue";
import gsap from "gsap";
import CreateCapsuleModal from "@/components/CapsuleShelf/CreateCapsuleModal.vue";


const showCreateModal= ref<boolean>(false);
const { navigateToDate, pendingCreateDate, setPendingCreateDate } = useCalendarAction();

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



const gateRef = ref<HTMLElement | null>(null)
const gateHoverY = ref(0)
const onGatePointerEnter = (e: PointerEvent) => {
  const rect = gateRef.value?.getBoundingClientRect()
  if (!rect) return
  gateHoverY.value = e.clientY - rect.top
}
const onGatePointerLeave = () => {
}

const switchViewMode = async (mode: 'single' | 'double'): Promise<void> => {
  if (mode === store.viewMode) return

  if (mode === 'double') {
    const singleEl = document.querySelector('.single-shelf-mode') as HTMLElement
    if (!singleEl) { store.setViewMode('double'); return }

    const origOverflow = singleEl.style.overflow
    singleEl.style.overflow = 'visible'
    await new Promise<void>(resolve => {
      gsap.to(singleEl, {
        x: '100dvi', opacity: 0, duration: 0.35, ease: 'power2.in',
        onComplete: () => {
          singleEl.style.overflow = origOverflow
          gsap.set(singleEl, { clearProps: 'all' })
          resolve()
        }
      })
    })
    store.setViewMode('double')
    await nextTick()

    const tlCol = document.querySelector('.timeline-column') as HTMLElement
    const unsCol = document.querySelector('.unscheduled-column') as HTMLElement
    const gate = document.querySelector('.gate-gap') as HTMLElement
    if (gate) gsap.set(gate, { opacity: 1 })

    const doubleShelf = document.querySelector('.double-shelf') as HTMLElement
    if (doubleShelf && tlCol && unsCol) {
      const shelfW = doubleShelf.offsetWidth
      gsap.set(tlCol, { x: shelfW })
      gsap.set(unsCol, { x: -shelfW })
      await new Promise<void>(resolve => {
        const tl = gsap.timeline({ onComplete: resolve })
        tl.to(tlCol, { x: 0, duration: 0.45, ease: 'backOut(1.2)' }, 0)
        tl.to(unsCol, { x: 0, duration: 0.45, ease: 'backOut(1.2)' }, 0)
      })
    }
  } else {
    const tlCol = document.querySelector('.timeline-column') as HTMLElement
    const unsCol = document.querySelector('.unscheduled-column') as HTMLElement
    const gate = document.querySelector('.gate-gap') as HTMLElement

    const doubleShelf = document.querySelector('.double-shelf') as HTMLElement
    if (doubleShelf && tlCol && unsCol) {
      const shelfW = doubleShelf.offsetWidth
      await new Promise<void>(resolve => {
        const tl = gsap.timeline({ onComplete: resolve })
        if (gate) tl.to(gate, { opacity: 0, duration: 0.1 }, 0)
        tl.to(tlCol, { x: shelfW, duration: 0.35, ease: 'power2.in' }, 0)
        tl.to(unsCol, { x: -shelfW, duration: 0.35, ease: 'power2.in' }, 0)
      })
    }

    const singleEl = document.querySelector('.single-shelf-mode') as HTMLElement
    let origOverflow = ''
    if (singleEl) {
      origOverflow = singleEl.style.overflow
      gsap.set(singleEl, { x: '100dvi', opacity: 0, overflow: 'visible' })
    }

    store.setViewMode('single')
    await nextTick()

    if (!singleEl) return

    await new Promise<void>(resolve => {
      gsap.to(singleEl!, {
        x: 0, opacity: 1, duration: 0.35, ease: 'power2.out',
        onComplete: () => {
          singleEl!.style.overflow = origOverflow
          gsap.set(singleEl!, { clearProps: 'all' })
          resolve()
        }
      })
    })
  }
}

const switchDisplayMode = (mode: any) => {
  store.setDisplayMode(mode);
};

const nextDisplayMode = () => {
  const modes = ['all', 'first-last', 'first', 'last']
  const idx = modes.indexOf(store.displayMode)
  store.setDisplayMode(modes[(idx + 1) % modes.length] as DisplayMode)
}

watch(() => navigateToDate.value, async (newDate) => {
  if (!newDate) return
  if (store.viewMode !== 'double') {
    await switchViewMode('double');
  }
  await nextTick()
  const timelineCol = document.querySelector('.timeline-column')
  if (!timelineCol) { navigateToDate.value = ''; return }
  let target = timelineCol.querySelector(`[data-need-to-be-scrolled-date="${newDate}"]`) as HTMLElement | null
  if (!target) {
    const dates = timelineGrouped.value.map(g => g.date)
    const nearest = findNearestDate(newDate, dates)
    if (nearest) {
      target = timelineCol.querySelector(`[data-need-to-be-scrolled-date="${nearest}"]`) as HTMLElement | null
    }
  }
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  setTimeout(() => { navigateToDate.value = '' })
})
watch(pendingCreateDate, (date) => {
  if (date) showCreateModal.value = true
})

function onCloseModal() {
  showCreateModal.value = false
  setPendingCreateDate('')
}


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
<!--    <div class="toolbar">
      <button @click="showCreateModal = true">+ 新建</button>
    </div>-->
    <!-- 单列模式 -->
    <div v-show="store.viewMode === 'single'" class="single-shelf-mode">
      <button class="fab" @click="showCreateModal = true">+</button>
      <div class="single-shelf capsule-in">
        <CapsuleComponent
            v-for="item in store.byCreatedAt"
            :key="item.id"
            :capsule="item"
        />
      </div>
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
            />
          </div>
        </div>
      </div>

      <div
          ref="gateRef"
          class="gate-gap"
          @pointerenter="onGatePointerEnter"
          @pointerleave="onGatePointerLeave"
      >
        <div class="gate-btn-group" :style="{ '--hover-y': gateHoverY + 'px' }">
          <button class="gate-btn" @click="switchViewMode('single')">单</button>
          <button class="gate-btn" @click="showCreateModal = true">+</button>
          <button class="gate-btn" @click="nextDisplayMode">···</button>
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
  <CreateCapsuleModal
    v-if="showCreateModal"
    :preselectedDate="pendingCreateDate"
    @close="onCloseModal"
  />
</template>




<style scoped>
/* ── 容器 ── */
.capsule-container {
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
.single-shelf, .double-shelf {
  contain: layout style;
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
/* ── 单列模式（FAB + 胶囊列表） ── */
.single-shelf-mode {
  display: flex;
  flex-direction: row;
  block-size: 100%;
  position: relative;
}
.single-shelf {
  flex: 1;
}
.fab {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-inline-start: 1.75rem;
  inline-size: 3.5rem;
  block-size: 3.5rem;
  border-radius: 50%;
  border: none;
  background: var(--theme-link);
  color: #fff;
  font-size: 1.75rem;
  cursor: pointer;
  z-index: 10;
  display: grid;
  place-items: center;
  box-shadow: 0 0.25rem 0.75rem rgba(0,0,0,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
.fab:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 0.35rem 1rem rgba(0,0,0,0.4);
}
/* ── 双列 ── */
.double-shelf {
  display: flex;
  flex-direction: row;
  gap: 1dvi;
  block-size: 100%;
  overflow: hidden;
}

.gate-gap {
  inline-size: 0.125rem;
  flex-shrink: 0;
  background: var(--calendar-grid-line);
  cursor: pointer;
  position: relative;
  transition: inline-size 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.gate-gap:hover {
  inline-size: 4rem;
}
.gate-btn-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: absolute;
  top: 0;
  /*noinspection CssUnresolvedCustomProperty*/
  transform: translateY(calc(var(--hover-y, 50%) - 50%));
  opacity: 0;
  transition: opacity 0.2s 0.15s;
  pointer-events: none;
}
.gate-gap:hover .gate-btn-group {
  opacity: 1;
  pointer-events: auto;
}
.gate-btn {
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: 50%;
  border: none;
  background: var(--theme-bg-button);
  color: var(--theme-color);
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 1rem;
}
.gate-btn:hover {
  background: var(--theme-link);
  color: #fff;
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