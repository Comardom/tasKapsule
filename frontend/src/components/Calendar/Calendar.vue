<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {Zh曜日,Jp曜日,En曜日} from "@/components/Calendar/nameOfDaysOfWeek.ts";
import Cell from "@/components/Calendar/Cell.vue";


import { timeZoneOptions } from '@/data/timezones.ts'

import {TimeManager} from '@/utils/TimeManager.ts'
import useLocaleStore from "@/stores/locale.ts";
const localeStore = useLocaleStore();


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
//为了每分钟刷新
let timer: ReturnType<typeof setInterval>;

const 总行数 = computed(() => {
  const 前置天数 = 月初曜日.value; // 需要显示的上月天数
  const 后置天数 = (7 - (前置天数 + 当月天数.value) % 7) % 7; // 需要显示的下月天数
  return (前置天数 + 当月天数.value + 后置天数) / 7 + 1;
});


const 曜日缩写 = computed(() => {
  switch (localeStore.locale)
  {
    case 'ja':  return Jp曜日;
    case 'zh':  return Zh曜日;
    default:    return En曜日;
  }
})
//如果时区变了就改变timerManager的时区
watch(()=>localeStore.timeZone,(newTz)=>{
  timeManager.setTimeZone(newTz);
  refreshCalendar();
});

const setCalendarHeight = () => {
  const calendarBodyEl = document.querySelector('.calendar-body') as HTMLElement;
  if (calendarBodyEl && cellInlineSize.value) {
    const calendarHeightInDvi = cellInlineSize.value * 总行数.value;
    calendarBodyEl.style.setProperty('--this-month-height-in-dvi', `${calendarHeightInDvi}dvi`);
  }
};

//这里是在计算日历横向除以七的宽度，好分配给每一周，这个仅仅是数字！！！这个7是随便预设的，就当是不存在
const cellInlineSize = ref<number>(7);
onMounted(() => {
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
  //每分钟刷新一下时间
  timer = setInterval(refreshCalendar, 60_000);
});
//计时器需要卸载
onUnmounted(() => {
  clearInterval(timer);
})


</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
      <div class="clock">

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
      >
        <span>{{ 曜日 }}</span>
      </Cell>
      <Cell
          v-for="day上月 in 月初曜日"
          :key="'prev-' + day上月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="lastMonthTail"
      >
        <span>{{ 上月天数 - 月初曜日 + day上月 }}</span>
      </Cell>
      <Cell
          v-for="day此月 in 当月天数"
          :key="'curr-' + day此月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="thisMonth"
          :class="{today: day此月 === 今天几号}"
      >
        <span>{{ day此月 }}</span>
      </Cell>
      <Cell
          v-for="day下月 in ((7 - (月初曜日 + 当月天数) % 7) % 7)"
          :key="'next-' + day下月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize="cellInlineSize"
          class="nextMonthHead"
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
  --full-block-size : 85dvb;
  --full-inline-size : 35dvi;
  display: flex;
  flex-direction: column;
  /*justify-content: center;*/
  align-items: center;
  /*这个是高度*/
  block-size: var(--full-block-size);
  /*这个是宽度*/
  inline-size: calc(var(--full-inline-size) + 3dvi);
  background-color: var(--calendar-frame-bg);
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
}
.calendar-header{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /*这个是高度*/
  block-size: 7dvb;
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
}
.calendar-body{
  font-size: 1.125rem;
  display: grid;
  place-content: center;
  place-items: center;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--calendar-cell-bg);
  /*这个是高度，由TS控制*/
  /*noinspection CssUnresolvedCustomProperty*/
  block-size: var(--this-month-height-in-dvi, auto);
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
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
.today{
  background: linear-gradient(
      to bottom,
      var(--calendar-today-bg-start),
      var(--calendar-today-bg-mid),
      var(--calendar-today-bg-end)
  );
}
.today span{
  color: var(--calendar-today-text);
}
</style>