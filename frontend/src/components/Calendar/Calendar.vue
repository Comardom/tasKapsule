<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Zh曜日,Jp曜日,En曜日} from "@/components/Calendar/nameOfDaysOfWeek.ts";
import Cell from "@/components/Calendar/Cell.vue";




import {TimeManager} from '@/utils/TimeManager.ts'

const timeManager = new TimeManager('Asia/Shanghai');

const 当月天数 = ref(timeManager.get当月天数());
const 上月天数 = ref(timeManager.get上月天数());

const 当天曜日 = ref(timeManager.get当天曜日());
const 月初曜日 = ref(timeManager.get月初曜日());
const 月末曜日 = ref(timeManager.get月末曜日());





const cellInlineSize = ref();

onMounted(() => {
  const calendarEl = document.querySelector('.calendar') as HTMLElement
  if (calendarEl) {
    const styles = getComputedStyle(calendarEl);
    const fullInlineSize = parseFloat(styles.getPropertyValue('--full-inline-size').trim());
    cellInlineSize.value = fullInlineSize / 7;
  }
});
</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
      <div class="clock">

      </div>
    </div>

    <div class="calendar-body">
      <Cell
          v-for="曜日缩写 in Zh曜日"
          :key="曜日缩写"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="曜日"
      >
        <span>{{ 曜日缩写 }}</span>
      </Cell>
      <Cell
          v-for="day上月 in 月初曜日"
          :key="day上月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="lastMonthTail"
      >
        <span>{{ 上月天数 - 月初曜日 + day上月 }}</span>
      </Cell>
      <Cell
          v-for="day此月 in 当月天数"
          :key="day此月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="thisMonth"
      >
        <span>{{ day此月 }}</span>
      </Cell>
      <Cell
          v-for="day下月 in (7 - (月初曜日 + 当月天数) % 7) % 7"
          :key="day下月"
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
  block-size: var(--full-block-size);
  inline-size: var(--full-inline-size);
  background-color: var(--theme-color);
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
}
.calendar-header{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  block-size: 10dvb;
  inline-size: inherit;
}
.calendar-body{
  display: grid;
  place-content: center;
  place-items: center;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--selection-bg);
  min-block-size: calc(var(--full-block-size) / 3 * 2 );
  max-inline-size: var(--full-inline-size);
}
.calendar-tail{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-block-size: 15dvb;
  inline-size: var(--full-inline-size);
}
</style>