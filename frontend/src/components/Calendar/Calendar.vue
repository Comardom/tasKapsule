<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {Zh曜日,Jp曜日,En曜日} from "@/data/nameOfDaysOfWeek.ts";
import Cell from "@/components/Calendar/Cell.vue";
import { timeZoneOptions } from '@/data/timezones.ts'
import {TimeManager} from '@/utils/TimeManager.ts'
import {useLocaleStore} from "@/stores/locale.ts";
import {useCapsuleStore} from "@/stores/capsule.ts";
import { useCalendarAction } from '@/composables/useCalendarAction';

//固定内容
const 曜日缩写 = computed(() => {
  switch (localeStore.locale)
  {
    case 'ja':  return Jp曜日;
    case 'zh':  return Zh曜日;
    default:    return En曜日;
  }
});
const 总行数 = computed(() => {
  const 前置天数 = 月初曜日.value; // 需要显示的上月天数
  const 后置天数 = (7 - (前置天数 + 当月天数.value) % 7) % 7; // 需要显示的下月天数
  return (前置天数 + 当月天数.value + 后置天数) / 7 + 1;
});

//pinia
const localeStore = useLocaleStore();
//如果时区变了就改变timerManager的时区
watch(()=>localeStore.timeZone,(newTz)=>{
  timeManager.setTimeZone(newTz);
  refreshCalendar();
});

//timeManager
const timeManager = new TimeManager(localeStore.timeZone);

const 今天几号 = ref<number>(timeManager.get今天几号());
const 当月天数 = ref<number>(timeManager.get当月天数());
const 上月天数 = ref<number>(timeManager.get上月天数());
//当天曜日、月末曜日未使用，但是暂时保留
const 当天曜日 = ref<number>(timeManager.get当天曜日());
const 月初曜日 = ref<number>(timeManager.get月初曜日());
const 月末曜日 = ref<number>(timeManager.get月末曜日());

function refreshCalendar(){
  timeManager.update();
  今天几号.value = timeManager.get今天几号();
  当月天数.value = timeManager.get当月天数();
  上月天数.value = timeManager.get上月天数();
  当天曜日.value = timeManager.get当天曜日();
  月初曜日.value = timeManager.get月初曜日();
  月末曜日.value = timeManager.get月末曜日();
  if([27, 28, 29, 30, 31, 1, 2].includes(今天几号.value))
  {
    nextTick(()=>{
      setCalendarHeight();
    });
  }
}



const setCalendarHeight = () => {
  const calendarBodyEl = document.querySelector('.calendar-body') as HTMLElement;
  if (calendarBodyEl && cellInlineSize.value) {
    const calendarHeightInDvi = cellInlineSize.value * 总行数.value;
    calendarBodyEl.style.setProperty('--this-month-height-in-dvi', `${calendarHeightInDvi}dvi`);
  }
};

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


const capsuleStore = useCapsuleStore();
const { setNavigateToDate, setPendingCreateDate } = useCalendarAction();

//格子点击事件的处理
const isSelectOtherMonth = ref<boolean>(false);
const selectedDay = ref<number>(今天几号.value);

function computeDate(whatDay: number, isOtherMonth: boolean): string {
  const { year, month } = timeManager.getFormatted();
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

function singleClick(whatDay: number, isOtherMonth: boolean) {
  isSelectOtherMonth.value = isOtherMonth;
  selectedDay.value = whatDay;
  capsuleStore.setDate(computeDate(whatDay, isOtherMonth));
}

function doubleClick(whatDay: number, isOtherMonth: boolean) {
  isSelectOtherMonth.value = isOtherMonth;
  selectedDay.value = whatDay;
  const date = computeDate(whatDay, isOtherMonth);
  capsuleStore.setDate(date);
  setNavigateToDate(date);
}

function handleRightClick(whatDay: number, isOtherMonth: boolean, event: MouseEvent) {
  event.preventDefault();
  setPendingCreateDate(computeDate(whatDay, isOtherMonth));
}

const clickTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const pendingCell = ref<{ whatDay: number; isOtherMonth: boolean } | null>(null);
function handleCellClick(whatDay: number, isOtherMonth: boolean) {
  if (clickTimer.value && pendingCell.value?.whatDay === whatDay && pendingCell.value?.isOtherMonth === isOtherMonth) {
    clearTimeout(clickTimer.value);
    clickTimer.value = null;
    pendingCell.value = null;
    doubleClick(whatDay, isOtherMonth);
    return;
  }
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
  }
  pendingCell.value = { whatDay, isOtherMonth };
  clickTimer.value = setTimeout(() => {
    clickTimer.value = null;
    pendingCell.value = null;
    singleClick(whatDay, isOtherMonth);
  }, 200);
}
</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
      <div class="clock">
        <button><span>这是clock区域</span></button>
      </div>
      <select
          v-model="localeStore.timeZone"
      >
        <option
            v-for="(item, index) in timeZoneOptions"
            :key="`tz-${index}`"
            :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
      <select v-model="localeStore.locale">
        <option value="zh">中文</option>
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </div>

    <div class="calendar-body">
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
          @click="handleCellClick(上月天数 - 月初曜日 + day上月,true)"
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
            'cell-gray-with-shadow': day此月 === 今天几号 && selectedDay != 今天几号,
          }"
          @click="handleCellClick(day此月,false)"
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
          @click="handleCellClick(day下月,true)"
          @contextmenu="handleRightClick(day下月,true,$event)"
      >
        <span>{{ day下月 }}</span>
      </Cell>
    </div>

    <div class="calendar-tail">

    </div>
  </div>
</template>

<style scoped>
.calendar{
  --cell-transition-duration: 0.25s;
  --full-block-size : 100dvb;
  --full-inline-size : 35dvi;
  display: flex;
  flex-direction: column;
  /*justify-content: center;*/
  align-items: center;
  /*这个是高度*/
  block-size: var(--full-block-size);
  /*这个是宽度*/
  inline-size: calc(var(--full-inline-size) + 3dvi);
  background-color: var(--calendar-bg);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
  /*backdrop-filter: blur(0.2rem);*/
}
.calendar-header{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /*这个是高度*/
  block-size: 12dvb;
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
}
.calendar-body{
  font-size: 1.25rem;

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
.calendar-tail{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /*这个是高度*/
  /*min-block-size: 15dvb;*/
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
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