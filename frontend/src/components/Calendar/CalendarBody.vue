<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {Zh曜日,Jp曜日,En曜日} from "@/data/nameOfDaysOfWeek.ts";
import Cell from "@/components/Calendar/Cell.vue";
import { timeZoneOptions } from '@/data/timezones.ts'
import {TimeManager} from '@/utils/TimeManager.ts'
import {useLocaleStore} from "@/stores/locale.ts";
import {useCapsuleStore} from "@/stores/capsule.ts";
import { useCalendarAction } from '@/composables/useCalendarAction';
import gsap from "gsap";





interface Props {
  displayYear: number;
  displayMonth: number;
  monthOffset: number;
  localeStore: ReturnType<typeof useLocaleStore>;
  timeManager: TimeManager;
}
const props = withDefaults(defineProps<Props>(), {
  monthOffset: 0,
});





//这里是在计算日历横向除以七的宽度，好分配给每一周，这个仅仅是数字！！！这个7是随便预设的，就当是不存在
const cellInlineSize = ref<number>(7);
//为了每分钟刷新
let timer: ReturnType<typeof setInterval>;
onMounted(() => {
  //计算宽度！
  const calendarEl = document.querySelector('.calendar') as HTMLElement
  if (calendarEl) {
    //这里是获取总宽度，然后除以七
    const styles = getComputedStyle(calendarEl);
    const fullInlineSize = parseFloat(styles.getPropertyValue('--full-inline-size').trim());
    if (!isNaN(fullInlineSize)) {
      cellInlineSize.value = fullInlineSize / 7;
      // 等待 DOM 更新后再设置高度
      nextTick(() => {
        setCalendarHeight();
      });
    }
  }
  //宽度计算完了

  //每分钟刷新一下时间
  timer = setInterval(refreshCalendar, 60_000);
});


onUnmounted(() => {
  //计时器需要卸载
  clearInterval(timer);
})


const 总行数 = computed(() => {
  const 前置天数 = 月初曜日.value; // 需要显示的上月天数
  const 后置天数 = (7 - (前置天数 + 当月天数.value) % 7) % 7; // 需要显示的下月天数
  return (前置天数 + 当月天数.value + 后置天数) / 7 + 1;
});



//这里是获取日历宽度，然后计算出高度
const setCalendarHeight = () => {
  const calendarBodyEl = document.querySelector('.calendar-body') as HTMLElement;
  if (calendarBodyEl && cellInlineSize.value) {
    const calendarHeightInDvi = cellInlineSize.value * 总行数.value;
    calendarBodyEl.style.setProperty('--this-month-height-in-dvi', `${calendarHeightInDvi}dvi`);
  }
};



const 曜日缩写 = computed(() => {
  switch (props.localeStore.locale)
  {
    case 'ja':  return Jp曜日;
    case 'zh':  return Zh曜日;
    default:    return En曜日;
  }
});




const capsuleStore = useCapsuleStore();
//setNavigateToDate是左键双击使用的日期, setPendingCreateDate是右键单击使用的日期
const { setNavigateToDate, setPendingCreateDate } = useCalendarAction();

//如果时区变了就改变timerManager的时区
watch(()=>props.localeStore.timeZone,(newTz)=>{
  props.timeManager.setTimeZone(newTz);
  refreshCalendar();
});


const wheelLocked = ref<boolean>(false);


const 今天几号 = ref<number>(props.timeManager.get今天几号());
/*const 当月天数 = ref<number>(timeManager.get当月天数());*/
const 当月天数 = computed(() => props.timeManager.get此月天数ByYM(props.displayYear, props.displayMonth));
/*const 上月天数 = ref<number>(timeManager.get上月天数());*/
const 上月天数 = computed(() => props.timeManager.get此月天数ByYM(props.displayYear, props.displayMonth - 1));
//当天曜日、月末曜日未使用，但是暂时保留
const 当天曜日 = ref<number>(props.timeManager.get当天曜日());
/*const 月初曜日 = ref<number>(timeManager.get月初曜日());*/
const 月初曜日 = computed(() => props.timeManager.get曜日ByYMD(props.displayYear, props.displayMonth, 1));
/*const 月末曜日 = ref<number>(timeManager.get月末曜日());*/
const 月末曜日 = computed(
    () => props.timeManager.get曜日ByYMD(props.displayYear, props.displayMonth + 1, 0)
);

function refreshCalendar(){
  props.timeManager.update();
  今天几号.value = props.timeManager.get今天几号();
  /*当月天数.value = timeManager.get当月天数();
  上月天数.value = timeManager.get上月天数();*/
  当天曜日.value = props.timeManager.get当天曜日();
  /*月初曜日.value = timeManager.get月初曜日();
  月末曜日.value = timeManager.get月末曜日();*/
  if([27, 28, 29, 30, 31, 1, 2].includes(今天几号.value))
  {
    nextTick(()=>{
      setCalendarHeight();
    });
  }
}


// 格子点击事件：单击高亮、双击跳转到双栏、右键弹创建弹窗
// 使用原生 @click / @dblclick / @contextmenu 区分，无防抖延迟
const isSelectOtherMonth = ref<boolean>(false);
const selectedDay = ref<number>(今天几号.value);


// 根据点击的格子和是否为其他月，算出标准的 YYYY-MM-DD 字符串
function computeDate(whatDay: number, isOtherMonth: boolean): string {
  /*const { year, month } = timeManager.getFormatted();*/
  const year = props.displayYear;
  const month = props.displayMonth;
  const monthOffset = !isOtherMonth ? 0 : (whatDay < 15 ? 1 : -1);
  const actualMonth = month + monthOffset;
  let targetYear = 1970, targetMonth = 0;
  if (actualMonth > 11) {
    targetYear = year + 1;
    targetMonth = 0;
  } else if (actualMonth < 0) {
    targetYear = year - 1;
    targetMonth = 11;
  } else {
    targetYear = year;
    targetMonth = actualMonth;
  }
  const day = String(whatDay).padStart(2, '0');
  const monthStr = String(targetMonth + 1).padStart(2, '0');
  return `${targetYear}-${monthStr}-${day}`;
}

// 单击 → 只更新选中日期的样式（高亮），不切换视图模式
function singleClick(whatDay: number, isOtherMonth: boolean) {
  isSelectOtherMonth.value = isOtherMonth;
  selectedDay.value = whatDay;
  capsuleStore.setDate(computeDate(whatDay, isOtherMonth));
}

// 双击 → 更新选中日期 + 通知 CapsuleShelf 切换到双栏并滚动到该日期
// 原生 dblclick 会先触发两次 singleClick，第二次 setDate 值相同时为 no-op
function doubleClick(whatDay: number, isOtherMonth: boolean) {
  isSelectOtherMonth.value = isOtherMonth;
  selectedDay.value = whatDay;
  const date = computeDate(whatDay, isOtherMonth);
  capsuleStore.setDate(date);
  setNavigateToDate(date);
}

// 右键 → 弹出创建弹窗并预填日期
function handleRightClick(whatDay: number, isOtherMonth: boolean, event: MouseEvent) {
  event.preventDefault();
  setPendingCreateDate(computeDate(whatDay, isOtherMonth));
}


const emit = defineEmits<{ wheel: [direction: number] }>();
function onWheel(e: WheelEvent) {
  e.preventDefault();
  if (wheelLocked.value) return;
  wheelLocked.value = true;
  emit('wheel', e.deltaY > 0 ? 1 : -1);
  setTimeout(() => { wheelLocked.value = false; }, 600);
  nextTick(() => setCalendarHeight());
}
</script>

<template>
  <div class="calendar-body" @wheel.prevent="onWheel">
      <Cell
          v-for="曜日 in 曜日缩写"
          :key="曜日"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="曜日"
          :interactive=false
      >
        <span>{{ 曜日 }}</span>
      </Cell>
      <Cell
          v-for="day上月 in 月初曜日"
          :key="'prev-' + day上月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="lastMonthTail"
          :class="{
            'cell-blue':上月天数 - 月初曜日 + day上月 === selectedDay && isSelectOtherMonth,
            'cell-gray':!(上月天数 - 月初曜日 + day上月 === selectedDay && isSelectOtherMonth)
          }"
          @click="singleClick(上月天数 - 月初曜日 + day上月,true)"
          @dblclick="doubleClick(上月天数 - 月初曜日 + day上月,true)"
          @contextmenu="handleRightClick(上月天数 - 月初曜日 + day上月,true,$event)"
      >
        <span>{{ 上月天数 - 月初曜日 + day上月 }}</span>
      </Cell>
      <Cell
          v-for="day此月 in 当月天数"
          :key="'curr-' + day此月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="thisMonth"
          :class="{
            'cell-blue': day此月 === selectedDay && !isSelectOtherMonth,
            'cell-gray-with-shadow':
              (monthOffset === 0)
              &&
              (day此月 === 今天几号 && (selectedDay != 今天几号 || isSelectOtherMonth)),
          }"
          @click="singleClick(day此月,false)"
          @dblclick="doubleClick(day此月,false)"
          @contextmenu="handleRightClick(day此月,false,$event)"
      >
        <span>{{ day此月 }}</span>
      </Cell>
      <Cell
          v-for="day下月 in ((7 - (月初曜日 + 当月天数) % 7) % 7)"
          :key="'next-' + day下月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize="cellInlineSize"
          class="nextMonthHead"
          :class="{
            'cell-blue':day下月 === selectedDay && isSelectOtherMonth,
            'cell-gray':!(day下月 === selectedDay && isSelectOtherMonth)
          }"
          @click="singleClick(day下月,true)"
          @dblclick="doubleClick(day下月,true)"
          @contextmenu="handleRightClick(day下月,true,$event)"
      >
        <span>{{ day下月 }}</span>
      </Cell>
    </div>
</template>

<style scoped>
.calendar-body{
  font-size: 1.25rem;
  /*margin-block: auto;*/
  flex: none;
  display: grid;
  place-content: center;
  /*place-items: center;*/
  grid-template-columns: repeat(7, 1fr);
  /*background-color: var(--calendar-cell-bg);*/
  /*这个是高度，由TS控制*/
  /*noinspection CssUnresolvedCustomProperty*/
  block-size: var(--this-month-height-in-dvi, auto);
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
  background: linear-gradient(155deg, rgba(255,255,255,0.01), transparent);

}
.cell-blue {
  background: linear-gradient(to bottom,
  color-mix(in srgb, var(--calendar-today-bg-start) 75%, transparent),
  color-mix(in srgb, var(--calendar-today-bg-mid) 75%, transparent),
  color-mix(in srgb, var(--calendar-today-bg-end) 75%, transparent));
  color: var(--calendar-today-text);
}
.cell-blue span {
  color: var(--calendar-today-text);
}
.cell-gray-with-shadow {
  background-color: var(--calendar-today-unselected-bg);
  /*box-shadow: inset 0 0 0.4rem 0.3rem var(--calendar-today-unselected-shadow);*/
  box-shadow:
      inset 0 0.1875rem 0.4rem 0.15rem rgba(0, 0, 0, 0.3),      /* 底部深阴影（重） */
      inset 0 -0.0625rem 0.15rem 0.05rem rgba(255, 255, 255, 0.05)!important;  /* 顶部微弱亮光（轻） */

  color: var(--calendar-today-unselected-text);
}
.cell-gray-with-shadow span {
  color: var(--calendar-today-unselected-text);
}
.cell-gray {
  background-color: var(--calendar-other-month-bg);
  color: var(--calendar-other-month-text);
}
.cell-gray span {
  color: var(--calendar-other-month-text);
}
</style>